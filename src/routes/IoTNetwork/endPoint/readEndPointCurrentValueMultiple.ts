/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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

import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { getProfileId, validateArrayRequestLimit } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import * as express from 'express';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/endpoint/read_multiple:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Read the current value of several endpoints at once
   *     description: >-
   *       Batch version of `/api/v1/endpoint/{id}/read` : the body is an array of endpoint dynamic IDs
   *       and the response holds one `{ dynamicId, currentValue }` entry per ID, in the same order.
   *
   *
   *       Each endpoint is read independently : a failure turns its entry into `{ dynamicId, error }`
   *       and the response comes back with **206 Partial Content**. At most 1000 IDs per call
   *       (configurable through `MULTIPLE_ROUTE_IDS_LIMIT`).
   *     tags:
   *       - IoTNetwork & Time Series
   *     requestBody:
   *       required: true
   *       description: The dynamic IDs of the endpoints.
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: integer
   *               format: int64
   *     responses:
   *       200:
   *         description: Every endpoint was read.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CurrentValueWithId'
   *       206:
   *         description: At least one endpoint could not be read; those entries hold an error instead.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/CurrentValueWithId'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: The body is not an array, or it holds more IDs than the configured limit.
   */
app.post("/api/v1/endpoint/read_multiple", async (req, res, next) => {
  try {
      const profileId = getProfileId(req);
      const ids: number[] = req.body;

      const validationError = validateArrayRequestLimit(ids);
      if (validationError) {
          return res.status(400).send(validationError);
      }

      // Map each id to a promise
      const promises = ids.map(async id => {
          try {
              const node = await spinalAPIMiddleware.load(id,profileId);
              // @ts-ignore
              SpinalGraphService._addNode(node);
              const element = await node.element.load();
              return { dynamicId: id, currentValue: element.currentValue.get() };
          } catch (error) {
              console.error(`Error with id ${id}: ${error.message || error}`);
              return {
                  dynamicId: id,
                  error: error.message || "Failed to get current value"
              };
          }
      });

      const settledResults = await Promise.allSettled(promises);
    
      const finalResults = settledResults.map(result => {
          return result.status === 'fulfilled' ? result.value : result.reason;
      });

      const isGotError = settledResults.some(result => result.status === 'rejected');
      if (isGotError) {
          return res.status(206).json(finalResults);
      }
      return res.status(200).json(finalResults);
  } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send(error.message || "Error processing the request");
  }
});
}
