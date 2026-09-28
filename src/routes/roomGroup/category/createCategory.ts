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
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { getProfileId } from '../../../utilities/requestUtilities';
import { awaitSync } from '../../../utilities/awaitSync';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/roomsGroup/{id}/create_category:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create a category in a group context
   *     description: >-
   *       Adds a category to a group context. Categories are the first level of the context; groups are
   *       then created inside them with `/api/v1/roomsGroup/{contextId}/category/{categoryId}/create_group`.
   *     tags:
   *       - Rooms Group
   *     parameters:
   *       - in: path
   *         name: id
   *         description: Dynamic ID of the group context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - categoryName
   *             properties:
   *               categoryName:
   *                 type: string
   *               categoryIcon:
   *                 type: string
   *                 description: Optional display icon.
   *               categoryColor:
   *                 type: string
   *                 description: Optional display colour, stored as a `color` attribute on the category.
   *     responses:
   *       200:
   *         description: The created category.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: The context could not be loaded, or the category could not be created.
   *       401:
   *         description: The profile is not allowed to write on this context.
   */

  app.post("/api/v1/roomsGroup/:id/create_category", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(context)
      if (context.getType().get() !== "geographicRoomGroupContext") {
        return res.status(400).send("Context is not type of geographicRoomGroupContext (This is not a room group context)");
      }
      const category = await groupManagerService.addCategory(context.getId().get(), req.body.categoryName, req.body.categoryIcon);
      if(req.body.categoryColor){
        category.info.add_attr({color : req.body.categoryColor})
      }


      await awaitSync(category);
      return res.status(200).json({
        name: category.getName().get(),
        staticId: category.getId().get(),
        dynamicId: category._server_id,
        type: category.getType().get(),
        icon: category.info.icon?.get(),
        color : category.info.color?.get()
      });


    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      return res.status(400).send(error.message)
    }
  })

}
