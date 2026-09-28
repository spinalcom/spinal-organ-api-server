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

import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import {
  SpinalContext,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { EndPointNodeAttribut } from '../interfacesEndpointAndTimeSeries';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/endpoint/{id}/attributsList:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the attributes of an endpoint
   *     description: >-
   *       Returns the attribute categories of an endpoint with the attributes they hold - the same
   *       shape as `/api/v1/node/{id}/attribute_list`, kept here for the IoT routes.
   *
   *
   *       This is where the `controlValue` and `timeSeries maxDay` attributes of an endpoint can be
   *       read. Despite the singular-looking schema, the response is an **array** of categories.
   *     tags:
   *       - IoTNetwork & Time Series
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the endpoint.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The attribute categories of the endpoint.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                  $ref: '#/components/schemas/EndPointNodeAttribut'
   *       401:
   *         description: The profile is not allowed to read this endpoint.
   *       500:
   *         description: The endpoint could not be loaded or its attributes could not be read.
   */

  app.get('/api/v1/endpoint/:id/attributsList', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const node = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );
      // @ts-ignore
      SpinalGraphService._addNode(node);
      const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);
      const prom = childrens.map(async (child) => {
        const attributs = await child.element.load();
        const info: EndPointNodeAttribut = {
          dynamicId: child._server_id,
          staticId: child.getId().get(),
          name: child.getName().get(),
          type: child.getType().get(),
          attributs: attributs.get(),
        };
        return info;
      });
      const json = await Promise.all(prom);
      return res.json(json);
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error.message);
    }
  });
};
