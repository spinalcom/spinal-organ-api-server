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
import SpinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from "spinal-env-viewer-task-service";
import { ContextEvent } from '../interfacesContextsEvents'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: SpinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/eventContext/{ContextId}/eventCategory/{CategoryId}/create_group:
*   post:
*     security: 
*       - OauthSecurity: 
*         - read
*     description: create event group
*     summary: create event group
*     tags:
*       - Calendar & Event
*     parameters:
*      - in: path
*        name: ContextId
*        description: use the dynamic ID
*        required: true
*        schema:
*          type: integer
*          format: int64
*      - in: path
*        name: CategoryId
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
*               - configEventGroup
*             properties:
*                groupName:
*                 type: string
*                color:
*                 type: string
*     responses:
*       200:
*         description: Create Successfully
*       400:
*         description: Bad request
*/

  app.post("/api/v1/eventContext/:ContextId/eventCategory/:CategoryId/create_group", async (req, res, next) => {
    try {
      var context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.ContextId, 10));
      //@ts-ignore
      SpinalGraphService._addNode(context)
      var category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.CategoryId, 10));
      //@ts-ignore
      SpinalGraphService._addNode(category)
      if (context instanceof SpinalContext && category.belongsToContext(context)) {
        if (context.getType().get() === "SpinalEventGroupContext") {
          SpinalEventService.createEventGroup(context.getId().get(), category.getId().get(), req.body.groupName, req.body.color)
        }
        else {
          return res.status(400).send("this context is not a SpinalEventGroupContext");
        }
      } else {
        res.status(400).send("node not found in context");
      }

    } catch (error) {
      console.error(error)
      res.status(400).send()
    }
    res.json();
  })

}
