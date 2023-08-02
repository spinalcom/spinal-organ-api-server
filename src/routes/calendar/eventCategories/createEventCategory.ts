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
* /api/v1/eventContext/{id}/create_category:
*   post:
*     security: 
*       - OauthSecurity: 
*         - read
*     description: create event category
*     summary: create event category
*     tags:
*       - Calendar & Event
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
*               - configEventCategory
*             properties:
*                categoryName:
*                 type: string
*                icon:
*                 type: string
*     responses:
*       200:
*         description: Success
*         content:
*           application/json:
*             schema: 
*                $ref: '#/components/schemas/Context'
*       400:
*         description: Bad request
*/



  app.post("/api/v1/eventContext/:id/create_category", async (req, res, next) => {

    try {
      var context: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      //@ts-ignore
      SpinalGraphService._addNode(context)
      const gategory = await SpinalEventService.createEventCategory(context.getId().get(), req.body.categoryName, req.body.icon);
      if (gategory !== undefined) {
        var objCategory = {
          staticId: gategory.id.get(),
          name: gategory.name.get(),
          type: gategory.type.get(),
          icon: gategory.icon.get(),
        }
        res.json(objCategory);
      }
    } catch (error) {
      console.error(error)
      res.status(400).send("ko")
    }
  })

}
