"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinalTimeSeries_1 = __importDefault(require("../spinalTimeSeries"));
const moment_1 = __importDefault(require("moment"));
const XLSX = __importStar(require("xlsx"));
const requestUtilities_1 = require("../../../utilities/requestUtilities");
// Excel serial -> JS Date (UTC)
function excelSerialToDate(serial) {
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
module.exports = function (logger, app, spinalAPIMiddleware) {
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
    app.post('/api/v1/endpoint/:id/timeSeries/bulk-insert', async (req, res) => {
        try {
            const f = req.files?.file;
            if (!f)
                return res.status(400).json({ error: "Missing file field 'file'" });
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            const timeseries = await (0, spinalTimeSeries_1.default)().getOrCreateTimeSeries(node.getId().get());
            const dateCol = String(req.query.dateCol || 'date');
            const valueCol = String(req.query.valueCol || 'value');
            const requestedSheet = req.query.sheet
                ? String(req.query.sheet)
                : undefined;
            const dryRun = String(req.query.dryRun || 'false').toLowerCase() === 'true';
            // Read workbook
            const wb = XLSX.read(f.data, {
                type: 'buffer',
                cellDates: true, // try to keep dates as Date objects when possible
            });
            const sheetName = requestedSheet || wb.SheetNames[0];
            if (!sheetName)
                return res.status(400).json({ error: 'No sheets found in workbook' });
            const ws = wb.Sheets[sheetName];
            if (!ws)
                return res.status(400).json({ error: `Sheet not found: ${sheetName}` });
            // Parse rows
            const rows = XLSX.utils.sheet_to_json(ws, {
                defval: null, // keep empty cells as null
                raw: true, // keep native types (Date, number for serial, etc.)
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
            const ok = [];
            const errors = [];
            for (let i = 0; i < rows.length; i++) {
                const idx = i + 2; // +2 (header row is row 1)
                const r = rows[i];
                const d = r[dateCol];
                const v = r[valueCol];
                // Coerce value
                const value = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
                if (!Number.isFinite(value)) {
                    errors.push({ idx, error: `Invalid number in '${valueCol}': ${v}` });
                    continue;
                }
                // Coerce date
                let dateObj = null;
                if (d instanceof Date) {
                    // Excel cell already parsed as Date
                    dateObj = d;
                }
                else if (typeof d === 'number') {
                    // Excel date serial
                    dateObj = excelSerialToDate(d);
                }
                else if (typeof d === 'string') {
                    const m = (0, moment_1.default)(d, acceptedDateFormats, true);
                    if (m.isValid())
                        dateObj = m.toDate();
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
        }
        catch (error) {
            if (error?.code && error?.message) {
                return res.status(error.code).send(error.message);
            }
            return res
                .status(400)
                .json({ error: error?.message ?? 'Bulk insert failed' });
        }
    });
};
//# sourceMappingURL=bulkInsertTimeSeries.js.map