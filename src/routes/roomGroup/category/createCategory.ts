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
 *         - read
 *     description: create category Room group
 *     summary: create category Room group
 *     tags:
 *       - Rooms Group
 *     parameters:
 *      - in: path
 *        name: id
 *        description: use the dynamic ID
 *        required: true
 *        schema:
 *          type: integer
 *          format: int64
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *             properties:
 *                categoryName:
 *                 type: string
 *                categoryIcon:
 *                 type: string
 *                categoryColor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Create Successfully
 *       400:
 *         description: Bad request
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
