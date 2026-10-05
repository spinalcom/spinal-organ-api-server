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
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Room } from '../interfacesGeoContext';
import { serviceTicketPersonalized } from 'spinal-service-ticket';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import getFiles from '../../../utilities/getFiles';
import { LOGS_EVENTS } from 'spinal-service-ticket/dist/Constants';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { getTicketListInfo } from '../../../utilities/getTicketListInfo';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/room/{id}/ticket_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the tickets declared on a room
   *     description: >-
   *       Returns the tickets attached to a room with their full details : priority, creation date,
   *       declarer, description, current process and step, workflow and attribute categories.
   *
   *
   *       Unlike the generic `/api/v1/node/{id}/ticket_list`, the items attached to each ticket
   *       (documents, notes, linked elements) are **always** included - there is no option to leave
   *       them out here.
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the room.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The tickets declared on the room (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Ticket'
   *       400:
   *         description: >-
   *           The node is not a room ("node is not of type geographicRoom"), or its tickets could not
   *           be read (body is `ko`).
   *       401:
   *         description: The profile is not allowed to read this room.
   */
  app.get('/api/v1/room/:id/ticket_list', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(room);
      if (!(room.getType().get() == 'geographicRoom')) {
        res.status(400).send('node is not of type geographicRoom');
        return;
      }
      const result = await getTicketListInfo(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10), true);
      return res.json(result);
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send('ko');
    }
  });
};
