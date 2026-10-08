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

import * as express from 'express';
import { EndPointNode } from '../interface/EndPointNode';
import { getEndpointsInfo } from '../../utilities/getEndpointInfo';
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{id}/endpoint_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the BMS endpoints under a node
   *     description: >-
   *       Walks the node through the BMS relations (`hasEndPoint`, `hasBmsDevice`, `hasBmsEndpoint`,
   *       `hasBmsEndpointGroup`) and returns every `BmsEndpoint` found below it, at any depth. Works on
   *       any node that carries BMS equipment : a room, a piece of equipment, a device, a network.
   *
   *
   *       `currentValue` is the last value known by the hub, not a fresh reading from the field.
   *     tags:
   *      - Nodes
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the node to walk.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: query
   *        name: includeDetails
   *        description: >-
   *          Set to `true` to also read the `controlValue` and `timeSeries maxDay` attributes of every
   *          endpoint (returned as `controlValue` and `timeseriesRetentionDays`). This costs one extra
   *          attribute read per endpoint, so leave it off on large walks.
   *        required: false
   *        schema:
   *          type: boolean
   *          default: false
   *     responses:
   *       200:
   *         description: The endpoints found below the node (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/EndPointNode'
   *       400:
   *         description: The node could not be loaded ("list of endpoints is not loaded").
   *       401:
   *         description: The profile is not allowed to read this node.
   */

  app.get('/api/v1/node/:id/endpoint_list', async (req, res, next) => {
    let nodes: EndPointNode[] = [];
    const includeDetails = req.query.includeDetails === 'true';

    try {
      const profileId = getProfileId(req);
      nodes = await getEndpointsInfo(
        spinalAPIMiddleware,
        profileId,
        parseInt(req.params.id, 10),
        includeDetails
      );
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(400).send('list of endpoints is not loaded');
    }
    res.send(nodes);
  });
};
