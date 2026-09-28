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

// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Room } from '../interfacesGeoContext';
import {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/room/{id}/read:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Read a room
   *     description: >-
   *       Returns the identity of a room : `dynamicId`, `staticId`, `name` and `type`, nothing more.
   *       For its attributes, equipment or endpoints use `/api/v1/room/{id}/read_static_details`.
   *
   *
   *       The node must be of type `geographicRoom`; anything else is rejected with 400.
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
   *         description: The room identity.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Room'
   *       400:
   *         description: The node is not a room ("node is not of type geographic room").
   *       401:
   *         description: The profile is not allowed to read this room.
   *       500:
   *         description: The room could not be loaded.
   */

  app.get('/api/v1/room/:id/read', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);

      const room: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );
      //@ts-ignore
      SpinalGraphService._addNode(room);
      if (room.getType().get() === 'geographicRoom') {
        const info: Room = {
          dynamicId: room._server_id,
          staticId: room.getId().get(),
          name: room.getName().get(),
          type: room.getType().get(),
        };
        return res.json(info);
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
