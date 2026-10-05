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
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { getRoomReferenceObjectsListInfo } from '../../../utilities/getRoomReferenceObjectListInfo';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/room/{id}/reference_Objects_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the reference objects of a room (deprecated alias)
   *     description: >-
   *       Kept for backwards compatibility, note the capital `O`. Identical result to
   *       `/api/v1/room/{id}/reference_object_list`, which should be used instead.
   *     deprecated: true
   *     tags:
   *      - Geographic Context
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
   *         description: The room with its reference objects.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/RoomReferenceObjectResponse'
   *       400:
   *         description: The room could not be loaded ("list of reference_Objects is not loaded").
   *       401:
   *         description: The profile is not allowed to read this room.
   */
  app.get("/api/v1/room/:id/reference_Objects_list", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const info = await getRoomReferenceObjectsListInfo(spinalAPIMiddleware,profileId, parseInt(req.params.id,10));
      return res.send(info);
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of reference_Objects is not loaded");
    }
  });

  /**
   * @swagger
   * /api/v1/room/{id}/reference_object_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the reference objects of a room
   *     description: >-
   *       Returns the room together with the objects attached to it through `hasReferenceObject`.
   *       Reference objects are BIM objects that a room points at without owning them - typically
   *       shared elements such as facades, ducts or structural parts.
   *
   *
   *       This is not the equipment of the room : use `/api/v1/room/{id}/equipment_list` for the
   *       objects the room owns.
   *     tags:
   *      - Geographic Context
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
   *         description: The room with its reference objects.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/RoomReferenceObjectResponse'
   *       400:
   *         description: The room could not be loaded ("list of reference_Objects is not loaded").
   *       401:
   *         description: The profile is not allowed to read this room.
   */

  app.get("/api/v1/room/:id/reference_object_list", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const info = await getRoomReferenceObjectsListInfo(spinalAPIMiddleware,profileId, parseInt(req.params.id,10));
      return res.send(info);
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of reference_Objects is not loaded");
    }
  });
};
