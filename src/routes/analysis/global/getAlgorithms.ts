import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import {
  ALGORITHM_DEFINITIONS,
  NUMBER_ALGORITHMS,
  NODE_ALGORITHMS,
  FLOW_CONTROL_ALGORITHMS,
  REGISTER_ALGORITHMS,
  NODE_ATTRIBUTES_ALGORITHMS,
  LIST_ALGORITHMS,
  BOOLEAN_ALGORITHMS,
  CONVERSION_ALGORITHMS,
  OBJECT_ALGORITHMS,
  TIMESERIES_ALGORITHMS,
  HTTP_ALGORITHMS,
  AlgorithmDefinition,
  VERSION,
} from "spinal-model-analysis";

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/analysis/algorithms:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns analysis algorithms grouped by category. Each algorithm contains its name, description, inputs (each input slot has a name, accepted types, description, required flag and optional variadic flag), output type, and parameters. The `run` function is not serialized.
   *     summary: Gets analysis algorithms grouped by category
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
   *                   type: object
   *                   properties:
   *                     NUMBER:
   *                       type: array
   *                       items:
   *                         type: object
   *                     NODE:
   *                       type: array
   *                       items:
   *                         type: object
   *                     FLOW_CONTROL:
   *                       type: array
   *                       items:
   *                         type: object
   *                     REGISTER:
   *                       type: array
   *                       items:
   *                         type: object
   *                     OTHER:
   *                       type: array
   *                       items:
   *                         type: object
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

      const serialize = (a: AlgorithmDefinition) => ({
        name: a.name,
        description: a.description,
        inputs: a.inputs,
        outputType: a.outputType,
        parameters: a.parameters,
      });

      const categorized: AlgorithmDefinition[] = [
        ...NUMBER_ALGORITHMS,
        ...NODE_ALGORITHMS,
        ...FLOW_CONTROL_ALGORITHMS,
        ...REGISTER_ALGORITHMS,
        ...NODE_ATTRIBUTES_ALGORITHMS,
        ...LIST_ALGORITHMS,
        ...BOOLEAN_ALGORITHMS,
        ...CONVERSION_ALGORITHMS,
        ...OBJECT_ALGORITHMS,
        ...TIMESERIES_ALGORITHMS,
        ...HTTP_ALGORITHMS,
      ];
      const categorizedNames = new Set(categorized.map(a => a.name));
      const other = ALGORITHM_DEFINITIONS.filter(a => !categorizedNames.has(a.name));

      const data = {
        NUMBER: NUMBER_ALGORITHMS.map(serialize),
        NODE: NODE_ALGORITHMS.map(serialize),
        FLOW_CONTROL: FLOW_CONTROL_ALGORITHMS.map(serialize),
        REGISTER: REGISTER_ALGORITHMS.map(serialize),
        NODE_ATTRIBUTES: NODE_ATTRIBUTES_ALGORITHMS.map(serialize),
        LIST: LIST_ALGORITHMS.map(serialize),
        BOOLEAN: BOOLEAN_ALGORITHMS.map(serialize),
        CONVERSION: CONVERSION_ALGORITHMS.map(serialize),
        OBJECT: OBJECT_ALGORITHMS.map(serialize),
        TIMESERIES: TIMESERIES_ALGORITHMS.map(serialize),
        HTTP: HTTP_ALGORITHMS.map(serialize),
        OTHER: other.map(serialize),
      };

      const count = Object.values(data).reduce((acc, arr) => acc + arr.length, 0);

      return res.json({
        data,
        meta: {
          count,
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
