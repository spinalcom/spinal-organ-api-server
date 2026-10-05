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
import { CreateNode } from '../interface/CreateNode';
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';
import {
  SpinalGraphService,
  SpinalNode,
  SpinalContext,
} from 'spinal-env-viewer-graph-service';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/create:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create a node
   *     description: >-
   *       Creates a node and attaches it to an existing parent through the relation named by
   *       `parentToChildRelationName`. Every field of the body other than `parentId`,
   *       `parentToChildRelationName`, `parentToChildRelationType`, `addInContext` and `contextId` is
   *       copied as-is into the `info` of the new node (`name` and `type` included).
   *
   *
   *       When `addInContext` is true and `contextId` is given, the node is added inside that context,
   *       so it is reachable from the context traversal routes. Otherwise the node is only attached to
   *       its parent and will not appear in a context tree.
   *
   *
   *       The `dynamicId` returned is the freshly assigned `_server_id`. The hub assigns it
   *       asynchronously, so the route waits up to 500 ms for it; in the rare case where it is still
   *       not known the node is created but `dynamicId` comes back as `-1` (read the node again to get
   *       it).
   *     tags:
   *       - Nodes
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateNode'
   *     responses:
   *       201:
   *         description: The node was created and attached to its parent.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: The parent or the context could not be loaded, or the body is malformed.
   *       401:
   *         description: The profile is not allowed to write on the parent node.
   *       500:
   *         description: The node could not be created or attached.
   */

  app.post('/api/v1/node/create', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const body: CreateNode = req.body;
      const {
        parentId,
        parentToChildRelationName,
        parentToChildRelationType,
        addInContext,
        contextId,
        ...createNodeInfo
      } = body;
      const node = SpinalGraphService.createNode(createNodeInfo);
      const parent: SpinalNode<any> = await spinalAPIMiddleware.load(
        parentId,
        profileId
      );
      // @ts-ignore
      SpinalGraphService._addNode(parent);
      if (addInContext && contextId !== undefined) {
        const context: SpinalContext<any> = await spinalAPIMiddleware.load(
          contextId,
          profileId
        );
        await SpinalGraphService.addChildInContext(
          parent.info.id.get(),
          node,
          context.info.id.get(),
          parentToChildRelationName,
          parentToChildRelationType
        );
      } else {
        await SpinalGraphService.addChild(
          parent.info.id.get(),
          node,
          parentToChildRelationName,
          parentToChildRelationType
        );
      }
      const realNode = SpinalGraphService.getRealNode(node);
      let serverId = realNode._server_id;
      let count = 5;
      while (serverId === undefined && count >= 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        serverId = realNode._server_id;
        count--;
      }
      const info = {
        dynamicId: realNode._server_id || -1,
        staticId: realNode.getId().get(),
        name: realNode.getName().get(),
        type: realNode.getType().get(),
      };

      return res.status(201).json(info);
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  });
};
