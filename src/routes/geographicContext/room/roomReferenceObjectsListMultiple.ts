/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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

import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Floor } from '../interfacesGeoContext';
import { SpinalNode } from 'spinal-model-graph';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import {
  SpinalContext,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { getRoomReferenceObjectsListInfo } from '../../../utilities/getRoomReferenceObjectListInfo';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
 * @swagger
 * /api/v1/room/reference_object_list_multiple:
 *   post:
 *     security:
 *       - OauthSecurity:
 *         - readOnly
 *     description: Return reference objects for multiple rooms
 *     summary: Gets reference objects for multiple rooms
 *     tags:
 *      - Geographic Context
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: integer
 *               format: int64
 *     responses:
 *       200:
 *         description: Success - All reference objects fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   dynamicId:
 *                     type: "integer"
 *                   staticId:
 *                     type: "string"
 *                   name:
 *                     type: "string"
 *                   type:
 *                     type: "string"
 *                   bimFileId:
 *                     type: "string"
 *                   infoReferencesObjects:
 *                     type: "array"
 *                     items:
 *                       $ref: '#/components/schemas/RoomReferenceObjectResponse'
 *       206:
 *         description: Partial Content - Some reference objects could not be fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/RoomReferenceObjectResponse'
 *                   - $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 */
app.post('/api/v1/room/reference_object_list_multiple', async (req, res, next) => {
  try {
    const ids: number[] = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).send('Expected an array of IDs.');
    }

    // Map each id to a promise
    const promises = ids.map(id => getRoomReferenceObjectsListInfo(spinalAPIMiddleware, id));

    const settledResults = await Promise.allSettled(promises);

    const finalResults = settledResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Error with id ${ids[index]}: ${result.reason}`);
        return {
          dynamicId: ids[index],
          error: result.reason?.message || result.reason || "Failed to get Reference Objects"
        };
      }
    });

    const isGotError = settledResults.some(result => result.status === 'rejected');
    if(isGotError) return res.status(206).json(finalResults);
    return res.status(200).json(finalResults);
  } catch (error) {
    console.error(error);
    return res.status(400).send(error.message || "An error occurred while fetching reference objects.");
  }
});
};
