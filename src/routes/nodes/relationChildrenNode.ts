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
import { childrensNode, parentsNode } from '../../utilities/corseChildrenAndParentNode'
import { Node } from './interfacesNodes'
import {
  SpinalRelationLstPtr,
  SpinalRelationPtrLst,
  SpinalRelationRef
} from 'spinal-model-graph'
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
  * @swagger
  * /api/v1/relation/{id}/children_node:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: Return cildrens of relation node
  *     summary: Get childrens of relation with given ID node
  *     tags:
  *       - Nodes
  *     parameters:
  *      - in: path
  *        name: id
  *        description: use the dynamic ID
  *        required: true
  *        schema:
  *          type: integer
  *          format: int64
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *               type: array
  *               items:
  *                $ref: '#/components/schemas/Node'
  *       400:
  *         description: Bad request
  */

  app.get("/api/v1/relation/:id/children_node", async (req, res, next) => {

    try {
      let nodes;
      var node_list = [];
      const profileId = getProfileId(req);
      const relation = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);

      if (relation instanceof SpinalRelationLstPtr || relation instanceof SpinalRelationPtrLst || relation instanceof SpinalRelationRef) {
        nodes = await relation.getChildren();
        for (let index = 0; index < nodes.length; index++) {
          const children_node = childrensNode(nodes[index]);
          const parent_node = await parentsNode(nodes[index]);
          const info: Node = {
            dynamicId: nodes[index]._server_id,
            staticId: nodes[index].getId().get(),
            name: nodes[index].getName().get(),
            type: nodes[index].getType().get(),
            children_relation_list: children_node,
            parent_relation_list: parent_node

          };
          node_list.push(info);
        }
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(node_list);
  });
};
