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

import * as express from 'express';
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';
import { getNodePositionInContext } from '../../utilities/getNodePositionInContext';
import { SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/context/{contextId}/node/{nodeId}/get_position:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get the paths that lead to a node inside a context
   *     description: >-
   *       Walks back up from a node to the root of a context and returns every path that reaches it.
   *       A node can hang under several parents, so `parentsInContext` holds one entry per path - for a
   *       room this is typically its floor, then its building, then the context itself.
   *
   *
   *       The structure is recursive : each entry has the same shape as the node itself and carries its
   *       own `parentsInContext`, which is empty on the context root. Only parents that belong to the
   *       given context are followed, so this is the position of the node *in that context*, not in the
   *       whole graph.
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: contextId
   *        description: Dynamic ID of the context the paths are built in.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: nodeId
   *        description: Dynamic ID of the node to locate.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The node with the recursive chain of its parents inside the context.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                 dynamicId:
   *                   type: integer
   *                   format: int64
   *                 type:
   *                   type: string
   *                 color:
   *                   type: string
   *                   description: Only present when the node carries one.
   *                 icon:
   *                   type: string
   *                   description: Only present when the node carries one.
   *                 parentsInContext:
   *                   type: array
   *                   description: >-
   *                     One entry per parent path, each with the same shape as this object. Empty once
   *                     the walk reaches the context root.
   *                   items:
   *                     type: object
   *       400:
   *         description: The node or the context could not be loaded ("Failed to get position").
   *       401:
   *         description: The profile is not allowed to read the node or the context.
   */
app.get("/api/v1/context/:contextId/node/:nodeId/get_position", async (req, res, next) => {
  try {
    const profileId = getProfileId(req);
    //const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
    //const contexts = await graph.getChildren("hasContext");
    //const groupContext = contexts.find(e => e.getName().get() === req.body.context);
    const node : SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);
    const context  : SpinalNode<any>= await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
    const result = await getNodePositionInContext(context, node);
    return res.json(result);

    //res.json(position);
  } catch (error) {
    if (error.code && error.message) return res.status(error.code).send(error.message);
    res.status(400).send(error.message || "Failed to get position");
  }
});
}
