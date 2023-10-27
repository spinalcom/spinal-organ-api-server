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

import SpinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { EndPointNode } from './interfacesNodes';
import { getEndpointsInfo } from '../../utilities/getEndpointInfo';
import {
  SpinalContext,
  SpinalGraphService,
  SpinalNode,
} from 'spinal-env-viewer-graph-service';
import {
  SpinalBmsEndpoint,
  SpinalBmsDevice,
  SpinalBmsEndpointGroup,
} from 'spinal-model-bmsnetwork';
const BMS_ENDPOINT_RELATIONS = [
  'hasEndPoint',
  SpinalBmsDevice.relationName,
  SpinalBmsEndpoint.relationName,
  SpinalBmsEndpointGroup.relationName,
];

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: SpinalAPIMiddleware
) {

  /**
 * @swagger
 * /api/v1/node/endpoint_list_multiple:
 *   post:
 *     security:
 *       - OauthSecurity:
 *         - readOnly
 *     description: Returns an array of lists of endpoints for multiple nodes, or error details.
 *     summary: Gets lists of endpoints for multiple nodes
 *     tags:
 *       - Nodes
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
 *         description: Success - All endpoint lists fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/EndPointNodeWithId'
 *       206:
 *         description: Partial Content - Some endpoint lists could not be fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       $ref: '#/components/schemas/EndPointNodeWithId'
 *                   - $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 */
app.post('/api/v1/node/endpoint_list_multiple', async (req, res, next) => {
  try {
      const ids: number[] = req.body;
      if (!Array.isArray(ids)) {
          return res.status(400).send('Expected an array of IDs.');
      }

      const promises = ids.map(id => getEndpointsInfo(spinalAPIMiddleware, id).then(endpoints => ({dynamicId: id, endpoints})));
      const settledResults = await Promise.allSettled(promises);
      
      const finalResults = settledResults.map((result, index) => {
          if (result.status === 'fulfilled') {
              return result.value;
          } else {
              console.error(`Error with id ${ids[index]}: ${result.reason}`);
              return {
                  dynamicId: ids[index],
                  error: result.reason?.message || result.reason || "Failed to get Endpoints"
              };
          }
      });

      const isGotError = settledResults.some(result => result.status === 'rejected');
      if (isGotError) {
          return res.status(206).json(finalResults);
      }
      return res.status(200).json(finalResults);
  } catch (error) {
      console.error(error);
      res.status(400).send('An error occurred while fetching endpoints.');
  }
});
};
