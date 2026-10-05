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

import * as express from 'express';
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';
import { getRoomPosition } from '../../utilities/getPosition';
import { getSpatialContext } from '../../utilities/getSpatialContext';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/room/{id}/get_position:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get the floor and building of a room
   *     description: >-
   *       Returns the room together with the floor, the building and the context it sits in, each as
   *       `{ dynamicId, staticId, name, type }`.
   *
   *
   *       The lookup runs inside the geographic context **named `spatial`** : the digital twin must hold
   *       a context of type `geographicContext` with that exact name, otherwise the request fails with
   *       "spatial context not found".
   *
   *
   *       The node must be of type `geographicRoom`, and it must be reachable from the spatial context
   *       through `hasGeographicRoom` / `hasGeographicFloor` / `hasGeographicBuilding` - a room hanging
   *       outside that chain makes the request fail.
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
   *         description: The room with its floor, building and context.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/RoomPosition'
   *       400:
   *         description: >-
   *           The node is not a room ("node is not of type geographicRoom"), the spatial context is
   *           missing, or the room is not attached to a floor and a building of that context
   *           ("Failed to get position").
   *       401:
   *         description: The profile is not allowed to read this room.
   */
app.get("/api/v1/room/:id/get_position", async (req, res, next) => {
  try {
    const profileId = getProfileId(req);
    const spatialContextId = (await getSpatialContext(spinalAPIMiddleware,profileId)).getId().get();
    const position = await getRoomPosition(spinalAPIMiddleware,profileId,spatialContextId, parseInt(req.params.id, 10));
    res.json(position);
  } catch (error) {
    if (error.code && error.message) return res.status(error.code).send(error.message);
    res.status(400).send(error.message || "Failed to get position");
  }
});
}
