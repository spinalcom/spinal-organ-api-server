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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from "spinal-env-viewer-task-service";
import { ContextEvent } from '../interfacesContextsEvents'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/eventContext/{id}/create_category:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create a category in an event context
   *     description: >-
   *       Adds a category to a calendar. Groups are then created inside it with
   *       `/api/v1/eventContext/{ContextId}/eventCategory/{CategoryId}/create_group`, and events land
   *       in those groups.
   *     tags:
   *       - Calendar & Event
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the event context.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
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
   *               icon:
   *                 type: string
   *                 description: Optional display icon.
   *     responses:
   *       200:
   *         description: The created category.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Context'
   *       400:
   *         description: The context could not be loaded, or the category could not be created.
   *       401:
   *         description: The profile is not allowed to write on this context.
   */



  app.post("/api/v1/eventContext/:id/create_category", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(context)
      const gategory = await SpinalEventService.createEventCategory(context.getId().get(), req.body.categoryName, req.body.icon);
      if (gategory !== undefined) {
        const objCategory = {
          staticId: gategory.id.get(),
          name: gategory.name.get(),
          type: gategory.type.get(),
          icon: gategory.icon.get(),
        }
        res.json(objCategory);
      }
      res.json();
    } catch (error) {
      console.error(error)
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send(error.message)
    }
  })

}
