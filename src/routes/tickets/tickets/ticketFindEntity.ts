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
import spinalAPIMiddleware from '../../../app/spinalAPIMiddleware';
import * as express from 'express';
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { serviceTicketPersonalized, STEP_TYPE } from 'spinal-service-ticket'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/ticket/{ticketId}/find_entity:
*   get:
*     security:
*       - bearerAuth:
*         - readOnly
*     description: Return entity of ticket
*     summary: Get entity of ticket
*     tags:
*       - Workflow & ticket
*     parameters:
*      - in: path
*        name: ticketId
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
*                $ref: '#/components/schemas/BasicNode'
*       400:
*         description: Bad request
*/
  app.get("/api/v1/ticket/:ticketId/find_entity", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      var _ticket = await spinalAPIMiddleware.load(parseInt(req.params.ticketId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(_ticket)

      // var elementSelected = await spinalAPIMiddleware.loadPtr(_ticket.info.elementSelected)
      const parents = await _ticket.getParents();
      const parent = parents.find(el => el.getType().get() !== STEP_TYPE);
      let info = {};
      if (parent) {
        info = {
          dynamicId: parent._server_id,
          staticId: parent.getId().get(),
          name: parent.getName().get(),
          type: parent.getType().get(),
        }
      }

      // var info = {
      //   dynamicId: elementSelected._server_id,
      //   staticId: elementSelected.getId().get(),
      //   name: elementSelected.getName().get(),
      //   type: elementSelected.getType().get(),
      // }

      res.status(200).json(info);
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  })
}
