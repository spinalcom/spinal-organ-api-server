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
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { Note } from '../interfacesGeoContext';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/room/{id}/notes:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the notes attached to a room
   *     description: >-
   *       Returns the notes written on a room as `{ date, type, message }`, where `date` is a
   *       timestamp in milliseconds and `type` the media type of the note.
   *
   *
   *       Same data as the generic `/api/v1/node/{id}/note_list`, with an extra check that the node
   *       really is a `geographicRoom`.
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
   *         description: The notes attached to the room (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Note'
   *       400:
   *         description: The node is not a room ("node is not of type geographic room").
   *       401:
   *         description: The profile is not allowed to read this room.
   *       500:
   *         description: The room could not be loaded or its notes could not be read.
   */
  app.get('/api/v1/room/:id/notes', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const room: SpinalNode = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );
      //@ts-ignore
      SpinalGraphService._addNode(room);
      if (room.getType().get() === 'geographicRoom') {
        const _notes = [];
        const notes = await serviceDocumentation.getNotes(room);
        for (const note of notes) {
          const infoNote: Note = {
            date: parseInt(note.element.date.get()),
            type: note.element.type.get(),
            message: note.element.message.get(),
          };
          _notes.push(infoNote);
        }
        return res.json(_notes);
      } else {
        return res.status(400).send('node is not of type geographic room');
      }
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error.message);
    }
  });
};
