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
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/groupContext/{contextId}/category/{categoryId}/group/{groupId}/delete:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Delete a group of a category
   *     description: >-
   *       Removes a group from a category. The items that were assigned to it are **not** deleted, they
   *       simply lose this grouping.
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
   *       - in: path
   *         name: groupId
   *         description: Dynamic ID of the group, which must belong to that category.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     responses:
   *       200:
   *         description: The group was deleted.
   *       400:
   *         description: The category or the group does not belong to the context.
   *       401:
   *         description: The profile is not allowed to write on this context.
   *       500:
   *         description: One of the nodes could not be loaded or removed.
   */
  app.delete("/api/v1/groupContext/:contextId/category/:categoryId/group/:groupId/delete", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(context)
      const category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(category)
      const group: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(group)

      if (!context || !(context instanceof SpinalContext)) {
        res.status(400).send("context not found");
        return;
      }

      if (!category || !category.belongsToContext(context)) {
        res.status(400).send("category not found");
        return;
      }

      if (!group || !group.belongsToContext(context)) {
        res.status(400).send("group not found");
        return;
      }
      await group.removeFromGraph();
      res.status(200).send("Deleted Successfully");

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  })
}
