import * as express from 'express';
import { childrensNode, parentsNode } from '../../../utilities/corseChildrenAndParentNode'
import { SpinalNode } from 'spinal-model-graph';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { ALGORITHMS  , VERSION } from "spinal-model-analysis";
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

/**
   * @swagger
   * /api/v1/analysis/algorithms:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns a list of algorithm for analysis
   *     summary: Gets analysis algorithms
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
   *                     type: string
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

  app.get("/api/v1/analysis/algorithms", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
                
      const data = ALGORITHMS ? Object.values(ALGORITHMS) : [];
      return res.json({
        data,
        meta: {
          count: data.length,
          analysisModuleVersion : VERSION
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
