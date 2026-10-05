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

import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { getRoomDetailsInfo } from '../../../utilities/getRoomDetailsInfo';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/room/{id}/read_details:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get the area and BIM objects of a room
   *     description: >-
   *       Returns the `area` of the room (read from the `area` attribute of its `Spatial` category),
   *       its `bimFileId`, and `_bimObjects`, the BIM objects attached to it grouped by BIM file with
   *       their dbids.
   *
   *
   *       This is the BIM-oriented view of a room. For its attributes, endpoints and groups use
   *       `/api/v1/room/{id}/read_static_details`.
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
   *         description: The area and BIM objects of the room.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/RoomDetails'
   *       401:
   *         description: The profile is not allowed to read this room.
   *       500:
   *         description: The room could not be loaded, or it is not of type `geographicRoom`.
   */

  app.get("/api/v1/room/:id/read_details", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const result = await getRoomDetailsInfo(spinalAPIMiddleware,profileId, parseInt(req.params.id,10));
      return res.json(result);
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  });
}
