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
import type { Express } from 'express';
import {
  childrensNode,
  parentsNode,
} from '../../utilities/corseChildrenAndParentNode';
import type { Node } from '../interface/Node';
import {
  SpinalRelationLstPtr,
  SpinalRelationPtrLst,
  SpinalRelationRef,
} from 'spinal-model-graph';
import { getProfileId } from '../../utilities/requestUtilities';
import type { ISpinalAPIMiddleware } from '../../interfaces';
module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/relation/{id}/children_node:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the children held by a relation
   *     description: >-
   *       Takes the dynamic ID of a **relation** (not of a node) and returns the nodes it points to.
   *       Relation dynamic IDs are the ones exposed in the `children_relation_list` /
   *       `parent_relation_list` of a node.
   *
   *
   *       The ID must designate a `SpinalRelationLstPtr`, `SpinalRelationPtrLst` or
   *       `SpinalRelationRef`; any other model is rejected with 400. Nodes come back in their short
   *       form (`dynamicId`, `staticId`, `name`, `type`).
   *     tags:
   *       - Nodes
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the relation.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The nodes held by the relation.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: The given ID is not a relation ("The given id is not an expected relation instance").
   *       401:
   *         description: The profile is not allowed to read this relation.
   *       500:
   *         description: The relation could not be loaded or read.
   */

  app.get('/api/v1/relation/:id/children_node', async (req, res, next) => {
    try {
      let nodes;
      var node_list = [];
      const profileId = getProfileId(req);
      const relation = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );

      if (
        relation instanceof SpinalRelationLstPtr ||
        relation instanceof SpinalRelationPtrLst ||
        relation instanceof SpinalRelationRef
      ) {
        nodes = await relation.getChildren();
        for (let index = 0; index < nodes.length; index++) {
          // const children_node = childrensNode(nodes[index]);
          // const parent_node = await parentsNode(nodes[index]);
          const info = {
            dynamicId: nodes[index]._server_id!,
            staticId: nodes[index].getId().get(),
            name: nodes[index].getName().get(),
            type: nodes[index].getType().get(),
            // children_relation_list: children_node,
            // parent_relation_list: parent_node,
          };
          node_list.push(info);
        }
        return res.json(node_list);
      } else {
        return res.status(400).send('The given id is not an expected relation instance');
      }
    } catch (error: any) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  });
};
