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
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { ContextNodeofTypes } from './interfacesContexts'
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/context/{contextId}/node/{nodeId}/nodesOfType/{type}:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the nodes of a given type under a node in a context
   *     description: >-
   *       Browses the subtree of `nodeId` inside `contextId` and returns the nodes matching `type`.
   *       The accepted values are the ones returned by
   *       `/api/v1/context/{contextId}/node/{nodeId}/nodeTypeList`; the comparison is case sensitive.
   *     tags:
   *       - Contexts/ontologies
   *     parameters:
   *      - in: path
   *        name: contextId
   *        description: Dynamic ID of the context.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: nodeId
   *        description: Dynamic ID of the node whose subtree is browsed. It must belong to the context.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: type
   *        description: Node type to filter on.
   *        required: true
   *        schema:
   *          type: string
   *     responses:
   *       200:
   *         description: The nodes of the requested type found under the node.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/ContextNodeofTypes'
   *       400:
   *         description: No node of this type exists under the node ("Type not found in node"), or the node does not belong to the context ("node not found in context").
   *       401:
   *         description: The profile is not allowed to read the context or the node.
   *       500:
   *         description: The context or the node could not be loaded.
   */
  app.get("/api/v1/context/:contextId/node/:nodeId/nodesOfType/:type", async (req, res, next) => {

    const nodes = [];

    try {
      const profileId = getProfileId(req);
      const contextNode = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
      const node = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);

      const SpinalContextNodeId = contextNode.getId().get();
      // @ts-ignore
      SpinalGraphService._addNode(contextNode);
      const SpinalNodeId = node.getId().get();
      // @ts-ignore
      SpinalGraphService._addNode(node);
      const type_list = await SpinalGraphService.browseAndClassifyByTypeInContext(SpinalNodeId, SpinalContextNodeId);

      if (req.params.type in type_list.data) {
        const model_list = type_list.data[req.params.type];
        if (contextNode instanceof SpinalContext && node.belongsToContext(contextNode)) {
          for (let index = 0; index < model_list.length; index++) {
            // hacky way use realnode when fiexd
            const realNode = model_list[index]._parents[0];
            // dynamicId: SpinalGraphService.getRealNode(model_list[index].id.get())._server_id,
            const info: ContextNodeofTypes = {
              dynamicId: realNode._server_id,
              staticId: model_list[index].id.get(),
              name: model_list[index].name.get(),
              type: model_list[index].type.get()

            };
            nodes.push(info);
          }
        } else {
          res.status(400).send("node not found in context");
        }
      } else {
        res.status(400).send("Type not found in node");
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(nodes);
  });

};
