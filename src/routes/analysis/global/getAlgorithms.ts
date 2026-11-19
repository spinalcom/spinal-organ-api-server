import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { getAlgorithmCatalog, VERSION } from "spinal-model-analysis";

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/analysis/algorithms:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns the block catalog — the analysis algorithms grouped by category, in display order. `data` maps each category id to its algorithms; `meta.categories` gives the categories in the same order with their display label, description and number of algorithms. Each algorithm contains its stable name, a display label, description, category id, search keywords (synonyms to match when searching — never shown), inputs (each input slot has a name, accepted types, description, required flag and optional variadic flag), output type, and parameters (name, type, description, required flag, and when relevant the allowed `options`, the `default` used when left empty, and a `multiline` flag for long text). The `run` function is not serialized. Pass ?locale=fr to get French category and algorithm text (each field falls back to English when untranslated).
   *     summary: Gets analysis algorithms grouped by category
   *     tags:
   *       - Analysis
   *     parameters:
   *       - in: query
   *         name: locale
   *         required: false
   *         schema:
   *           type: string
   *           enum: [en, fr]
   *         description: Language for label/description text (default en). Untranslated fields fall back to English.
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   description: Category id → its algorithms, keyed in display order.
   *                   additionalProperties:
   *                     type: array
   *                     items:
   *                       type: object
   *                 meta:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                     categories:
   *                       type: array
   *                       description: The categories in display order.
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           label:
   *                             type: string
   *                           description:
   *                             type: string
   *                           count:
   *                             type: integer
   *                     analysisModuleVersion:
   *                       type: string
   *       400:
   *         description: The algorithm catalogue could not be read.
   */

  app.get("/api/v1/analysis/algorithms", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      // Optional ?locale=fr. The module owns the catalog — categories, their order and labels,
      // and which algorithm goes where — so a block or category added there needs no change here.
      const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined;
      const catalog = getAlgorithmCatalog(locale);

      return res.json({
        data: catalog.algorithms,
        meta: {
          count: catalog.count,
          categories: catalog.categories,
          analysisModuleVersion: VERSION,
        }
      });

    } catch (error: any) {
      if (error?.code && error?.message) {
        return res.status(error.code).send(error.message);
      }
      if (error?.message) {
        return res.status(400).send(error.message);
      }
      console.error(error);
      return res.status(400).send(error);
    }
  });
}
