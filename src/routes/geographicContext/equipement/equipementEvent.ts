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
import { Event } from '../../calendar/interfacesContextsEvents'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/equipement/{id}/event_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the calendar events of an equipment
   *     description: >-
   *       Returns the `SpinalEvent` children of a piece of equipment. Unlike the room event route, there
   *       is no period filter here : every event is returned. The node must be of type `BIMObject`.
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the equipment (a `BIMObject`).
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The requested list (empty when there is nothing).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Event'
   *       400:
   *         description: The node is not a `BIMObject`.
   *       401:
   *         description: The profile is not allowed to read this equipment.
   *       500:
   *         description: The equipment could not be loaded or its events could not be read.
   */
  app.get("/api/v1/equipement/:id/event_list", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      var nodes = [];
      const equipement: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(equipement)
      if (equipement.getType().get() === "BIMObject") {
        const listEvents = await SpinalEventService.getEvents(equipement.getId().get())
        for (const child of listEvents) {
          // @ts-ignore
          const _child = SpinalGraphService.getRealNode(child.id.get())
          if (_child.getType().get() === "SpinalEvent") {
            const info = {
              dynamicId: _child._server_id,
              staticId: _child.getId()?.get(),
              name: _child.getName()?.get(),
              type: _child.getType()?.get(),
              groupID: _child.info.groupId?.get(),
              categoryID: child.categoryId?.get(),
              nodeId: _child.info.nodeId?.get(),
              repeat: _child.info.repeat?.get(),
              description: _child.info.description?.get(),
              startDate: _child.info.startDate?.get(),
              endDate: _child.info.endDate?.get(),
            };
            nodes.push(info);
          }
        }
      } else {
        res.status(400).send("node is not of type  BIMObject");
        return
      }


    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(nodes);
  })
}
