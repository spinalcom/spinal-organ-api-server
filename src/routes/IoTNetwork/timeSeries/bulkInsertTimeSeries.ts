import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import spinalServiceTimeSeries from '../spinalTimeSeries';
import * as express from 'express';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

// Excel serial -> JS Date (UTC)
function excelSerialToDate(serial: number): Date {
  // Excel's epoch starts at 1899-12-31 with a known leap-year bug.
  // 25569 = days between 1899-12-31 and 1970-01-01
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400; // seconds
  const fractionalDay = serial - Math.floor(serial);
  const totalSeconds = Math.round(utcValue + fractionalDay * 86400);
  return new Date(totalSeconds * 1000);
}

const ACCEPTED_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]);

module.exports = function (
  logger: any,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {

  /**
   * @swagger
   * /api/v1/endpoint/{id}/timeSeries/bulk-insert:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Bulk insert values from an Excel file
   *     description: >
   *       Upload an Excel file (.xls/.xlsx) containing a **date** column and a **value** column.<br/>
   *       Date formats supported in strings: "DD-MM-YYYY HH:mm:ss", "DD MM YYYY HH:mm:ss", "DD/MM/YYYY HH:mm:ss".<br/>
   *       Also supports Excel native date cells and Excel date serial numbers.
   *     tags:
   *       - IoTNetwork & Time Series
   *     parameters:
   *       - in: path
   *         name: id
   *         description: dynamic ID of the endpoint node
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: query
   *         name: dateCol
   *         schema: { type: string, default: date }
   *         description: Name of the date column in the Excel sheet
   *       - in: query
   *         name: valueCol
   *         schema: { type: string, default: value }
   *         description: Name of the numeric value column in the Excel sheet
   *       - in: query
   *         name: sheet
   *         schema: { type: string }
   *         description: Optional sheet name to use (defaults to first sheet)
   *       - in: query
   *         name: dryRun
   *         schema: { type: boolean, default: false }
   *         description: Validate and preview without inserting anything
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Insert summary
   *       400:
   *         description: Bad request
   *       422:
   *         description: Validation errors
   */
  app.post(
    '/api/v1/endpoint/:id/timeSeries/bulk-insert',
    async (req, res) => {
      try {
        const f: any = (req as any).files?.file;
        if (!f) return res.status(400).json({ error: "Missing file field 'file'" });
        
        const profileId = getProfileId(req);
        const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
        // @ts-ignore
        SpinalGraphService._addNode(node);

        const timeseries = await spinalServiceTimeSeries().getOrCreateTimeSeries(node.getId().get());

        const dateCol = String(req.query.dateCol || 'date');
        const valueCol = String(req.query.valueCol || 'value');
        const requestedSheet = req.query.sheet ? String(req.query.sheet) : undefined;
        const dryRun = String(req.query.dryRun || 'false').toLowerCase() === 'true';

        // Read workbook
        const wb = XLSX.read(f.data, {
          type: 'buffer',
          cellDates: true, // try to keep dates as Date objects when possible
        });

        const sheetName = requestedSheet || wb.SheetNames[0];
        if (!sheetName) return res.status(400).json({ error: 'No sheets found in workbook' });

        const ws = wb.Sheets[sheetName];
        if (!ws) return res.status(400).json({ error: `Sheet not found: ${sheetName}` });

        // Parse rows
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
          defval: null, // keep empty cells as null
          raw: true,    // keep native types (Date, number for serial, etc.)
        });

        if (!rows.length) {
          return res.status(422).json({ error: 'No data rows found in sheet' });
        }

        // Validate columns exist 
        const first = rows[0];
        const missingCols = [dateCol, valueCol].filter((k) => !(k in first));
        if (missingCols.length) {
          return res.status(422).json({
            error: 'Missing required columns',
            missing: missingCols,
            availableColumns: Object.keys(first),
          });
        }

        // Convert & validate each row
        const acceptedDateFormats = [
          'DD-MM-YYYY HH:mm:ss',
          'DD MM YYYY HH:mm:ss',
          'DD/MM/YYYY HH:mm:ss',
        ];

        type ParsedRow = { idx: number; date: Date; value: number };
        const ok: ParsedRow[] = [];
        const errors: Array<{ idx: number; error: string }> = [];

        for (let i = 0; i < rows.length; i++) {
          const idx = i + 2; // +2 (header row is row 1)
          const r = rows[i];

          const d: any = r[dateCol];
          const v: any = r[valueCol];

          // Coerce value
          const value = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
          if (!Number.isFinite(value)) {
            errors.push({ idx, error: `Invalid number in '${valueCol}': ${v}` });
            continue;
          }

          // Coerce date
          let dateObj: Date | null = null;

          if (d instanceof Date) {
            // Excel cell already parsed as Date
            dateObj = d;
          } else if (typeof d === 'number') {
            // Excel date serial
            dateObj = excelSerialToDate(d);
          } else if (typeof d === 'string') {
            const m = moment(d, acceptedDateFormats, true);
            if (m.isValid()) dateObj = m.toDate();
          }

          if (!dateObj || isNaN(dateObj.getTime())) {
            errors.push({ idx, error: `Invalid date in '${dateCol}': ${d}` });
            continue;
          }

          ok.push({ idx, date: dateObj, value });
        }

        if (!ok.length) {
          return res.status(422).json({
            error: 'No valid rows',
            rowErrors: errors.slice(0, 100), // cap error list
            totalRows: rows.length,
          });
        }

        // Dry run? Just report
        if (dryRun) {
          return res.json({
            sheet: sheetName,
            parsed: ok.length,
            skipped: errors.length,
            totalRows: rows.length,
            sample: ok.slice(0, 5), // preview first 5 rows
            rowErrors: errors.slice(0, 20),
            dryRun: true,
          });
        }

        // Insert sequentially (simple & safe). For very large files, consider chunking/queueing.
        let inserted = 0;
        for (const r of ok) {
          await timeseries.insert(r.value, r.date);
          inserted++;
        }

        return res.json({
          sheet: sheetName,
          inserted,
          skipped: errors.length,
          totalRows: rows.length,
          rowErrors: errors.slice(0, 50),
        });
      } catch (error: any) {
        if (error?.code && error?.message) {
          return res.status(error.code).send(error.message);
        }
        return res.status(400).json({ error: error?.message ?? 'Bulk insert failed' });
      }
    }
  );
};