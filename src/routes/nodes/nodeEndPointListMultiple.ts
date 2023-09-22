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
   *     description: Returns an array of lists of endpoints for multiple nodes
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
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/EndPointNodeWithId'
   *       400:
   *         description: Bad request
   */
  app.post('/api/v1/node/endpoint_list_multiple', async (req, res, next) => {
    const results = [];
    try {
      const ids: number[] = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).send('Expected an array of IDs.');
      }

      for (let id of ids) {
        const nodes = await getEndpointsInfo(spinalAPIMiddleware, id);
        results.push({dynamicId:id,endpoints:nodes});
      }
    } catch (error) {
      console.error(error);
      return res
        .status(400)
        .send('An error occurred while fetching endpoints.');
    }

    res.json(results);
  });
};
