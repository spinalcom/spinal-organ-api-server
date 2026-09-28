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
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from "spinal-env-viewer-task-service";
import { CategoryEvent } from '../../calendar/interfacesContextsEvents'
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/groupeContext/{contextId}/category/{categoryId}/group_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the groups of a category (deprecated alias)
   *     description: >-
   *       Kept for backwards compatibility : `groupeContext` is a historical misspelling of
   *       `groupContext`. Identical behaviour to `/api/v1/groupContext/{contextId}/category/{categoryId}/group_list`, which should be used instead.
   *     deprecated: true
   *     tags:
   *       - Group Context
   *     parameters:
   *       - in: path
   *         name: contextId
   *         description: Dynamic ID of the group context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: categoryId
   *         description: Dynamic ID of the category.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     responses:
   *       200:
   *         description: Same body as the non-deprecated route.
   *       400:
   *         description: Same errors as the non-deprecated route.
   *       401:
   *         description: The profile is not allowed to reach this context.
   */
  app.get("/api/v1/groupeContext/:contextId/category/:categoryId/group_list", async (req, res, next) => {

    const nodes = [];
    try {
      const profileId = getProfileId(req);
      const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(context)
      const category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(category)
      if (!(context instanceof SpinalContext)) {
        return res.status(400).send("The context Id provided does not represent a context");
      }
      if (!category.belongsToContext(context)) {
        return res.status(400).send("The category does not belong to the context");
      }
      const listGroups = await groupManagerService.getGroups(category.getId().get())
      for (const group of listGroups) {
        // @ts-ignore
        const realNode = SpinalGraphService.getRealNode(group.id.get())
        const info = {
          dynamicId: realNode._server_id,
          staticId: realNode.getId().get(),
          name: realNode.getName().get(),
          type: realNode.getType().get(),
          color: group.color?.get(),
          icon: group.icon?.get()
        };
        nodes.push(info);
      }
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);

      res.status(400).send("ko");
    }
    res.send(nodes);
  });


  /**
   * @swagger
   * /api/v1/groupContext/{contextId}/category/{categoryId}/group_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the groups of a category
   *     description: >-
   *       Returns the groups of a category. The category must belong to the given context.
   *     tags:
   *       - Group Context
   *     parameters:
   *       - in: path
   *         name: contextId
   *         description: Dynamic ID of the group context.
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
   *     responses:
   *       200:
   *         description: The groups of the category (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/CategoryEvent'
   *       400:
   *         description: >-
   *           `contextId` is not a context ("The context Id provided does not represent a context"), or
   *           the category does not belong to it ("The category does not belong to the context").
   *       401:
   *         description: The profile is not allowed to read this context.
   */

  app.get("/api/v1/groupContext/:contextId/category/:categoryId/group_list", async (req, res, next) => {

    const nodes = [];
    try {
      const profileId = getProfileId(req);
      const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(context)
      const category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(category)
      if (!(context instanceof SpinalContext)) {
        return res.status(400).send("The context Id provided does not represent a context");
      }
      if (!category.belongsToContext(context)) {
        return res.status(400).send("The category does not belong to the context");
      }
      const listGroups = await groupManagerService.getGroups(category.getId().get())
      for (const group of listGroups) {
        // @ts-ignore
        const realNode = SpinalGraphService.getRealNode(group.id.get())
        const info = {
          dynamicId: realNode._server_id,
          staticId: realNode.getId().get(),
          name: realNode.getName().get(),
          type: realNode.getType().get(),
          color: group.color?.get(),
          icon: group.icon?.get()
        };
        nodes.push(info);
      }
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);

      res.status(400).send("ko");
    }
    res.send(nodes);
  });
};

