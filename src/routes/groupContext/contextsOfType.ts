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
// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { ContextTree } from './interfacesGroupContexts'
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/groupContext/contextsOfType/{type}:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the group contexts of a given type
   *     description: >-
   *       Returns the group contexts of one type, which is how you find the contexts of a single family
   *       rather than all of them like `/api/v1/groupContext/list` does.
   *
   *
   *       `type` is one of the values returned by `/api/v1/groupContext/type_list`, for instance
   *       `geographicRoomGroupContext`, `BIMObjectGroupContext`, `BmsEndpointGroupContext` or
   *       `AttributeConfigurationGroupContext`.
   *     tags:
   *       - Group Context
   *     parameters:
   *       - in: path
   *         name: type
   *         description: Group context type to filter on.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: The group contexts of that type (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/ContextNodeofTypes'
   *       401:
   *         description: The profile is not allowed to read the graph.
   *       500:
   *         description: The profile graph could not be read.
   */

  app.get("/api/v1/groupContext/contextsOfType/:type", async (req, res, next) => {

    const nodes = [];
    try {

      const profileId = getProfileId(req);
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
      const groupContexts = await groupManagerService.getGroupContexts(req.params.type, graph);

      for (let index = 0; index < groupContexts.length; index++) {
        const realNode = SpinalGraphService.getRealNode(groupContexts[index].id)
        const info = {
          dynamicId: realNode._server_id,
          staticId: realNode.getId().get(),
          name: realNode.getName().get(),
          type: realNode.getType().get()
        };
        nodes.push(info);
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(nodes);
  });
};

