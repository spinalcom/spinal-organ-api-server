import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { TRIGGER_TYPE_DEFINITIONS, VERSION } from "spinal-model-analysis";
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
     * @swagger
     * /api/v1/analysis/triggerTypes:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Returns the available analysis trigger types along with the fields required to configure each one. Each field has a name, primitive type, description, and whether it is required.
     *     summary: Gets analysis trigger types and their configuration fields
     *     tags:
     *       - Analysis
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       type:
     *                         type: string
     *                         description: The trigger type identifier (e.g. INTERVAL_TIME, CRON, COV)
     *                       description:
     *                         type: string
     *                         description: When/how this trigger fires
     *                       fields:
     *                         type: array
     *                         items:
     *                           type: object
     *                           properties:
     *                             name:
     *                               type: string
     *                             type:
     *                               type: string
     *                               enum: [string, number, boolean]
     *                             description:
     *                               type: string
     *                             required:
     *                               type: boolean
     *                 meta:
     *                   type: object
     *                   properties:
     *                     count:
     *                       type: integer
     *                     analysisModuleVersion:
     *                       type: string
     *       400:
     *         description: Bad request
     */

  app.get("/api/v1/analysis/triggerTypes", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      const data = TRIGGER_TYPE_DEFINITIONS;

      return res.json({
        data,
        meta: {
          count: data.length,
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
