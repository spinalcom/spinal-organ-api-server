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

// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import groupManagerService from 'spinal-env-viewer-plugin-group-manager-service';
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/equipementsGroup/{contextId}/category/{categoryId}/group/{groupId}/addEquipements:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Assign equipment to a group
   *     description: >-
   *       Adds BIM objects to a group of an equipment group context. The body is an array of dynamic
   *       IDs; each one must designate a node of type `BIMObject`.
   *
   *
   *       The context must be a `BIMObjectGroupContext`, and the category and the group must both
   *       belong to it. An empty array is rejected.
   *     tags:
   *       - Equipements Group
   *     parameters:
   *       - in: path
   *         name: contextId
   *         description: Dynamic ID of the equipment group context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: categoryId
   *         description: Dynamic ID of the category, which must belong to that context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: groupId
   *         description: Dynamic ID of the group, which must belong to that context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       required: true
   *       description: The dynamic IDs of the equipment to assign.
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: integer
   *               format: int64
   *     responses:
   *       200:
   *         description: The equipment was assigned to the group.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: >-
   *           One of the nodes is not a `BIMObject` ("one of nodes is not type of BIMObject"), the
   *           array is empty, the context is not a `BIMObjectGroupContext`, or the category or the
   *           group does not belong to it.
   *       401:
   *         description: The profile is not allowed to write on this context.
   */

  app.post(
    '/api/v1/equipementsGroup/:contextId/category/:categoryId/group/:groupId/addEquipements',
    async (req, res, next) => {
      try {
        const profileId = getProfileId(req);
        const _equipementList = req.body;
        const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
        //@ts-ignore
        SpinalGraphService._addNode(context);

        const category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
        //@ts-ignore
        SpinalGraphService._addNode(category);

        const group: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
        //@ts-ignore
        SpinalGraphService._addNode(group);

        if (
          context instanceof SpinalContext &&
          category.belongsToContext(context) &&
          group.belongsToContext(context)
        ) {
          if (context.getType().get() === 'BIMObjectGroupContext') {
            if (_equipementList.length > 0) {
              for (let index = 0; index < _equipementList.length; index++) {
                const realNode = await spinalAPIMiddleware.load(
                  _equipementList[index],
                  profileId
                );
                //@ts-ignore
                SpinalGraphService._addNode(realNode);
                if (realNode.getType().get() === 'BIMObject') {
                  groupManagerService.linkElementToGroup(
                    context.getId().get(),
                    group.getId().get(),
                    realNode.getId().get()
                  );
                } else {
                  res.status(400).send('one of nodes is not type of BIMObject');
                }
              }
            } else {
              res.status(400).send(' list of equipement id is empty ');
            }
          } else {
            res.status(400).send('node is not type of BIMObjectGroupContext ');
          }
        } else {
          res.status(400).send('category or group not found in context');
        }

        res.json();
      } catch (error) {

        if (error.code && error.message) return res.status(error.code).send(error.message);
        res.status(400).send('ko');
      }

    }
  );
};
