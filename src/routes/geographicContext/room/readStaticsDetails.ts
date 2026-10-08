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
import { getRoomStaticDetailsInfo } from '../../../utilities/getStaticDetailsInfo';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/room/{id}/read_static_details:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get everything known about a room
   *     description: >-
   *       The full read of a room in one call : its identity and display fields, `attributsList` (its
   *       attribute categories with their attributes), `controlEndpoint` (its control points),
   *       `endpoints` (its BMS endpoints with their current values), `bimObjects` (the BIM objects it
   *       holds) and `groupParents` (the floor and the groups it belongs to, the room context aside).
   *
   *
   *       This is the heaviest room route - it walks all of the above in one pass. Prefer the
   *       dedicated routes when you only need one of these lists.
   *
   *
   *       The node must be of type `geographicRoom`; anything else fails with a 500.
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
   *         description: The complete static description of the room.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/StaticDetailsRoom'
   *       401:
   *         description: The profile is not allowed to read this room.
   *       500:
   *         description: The room could not be loaded, or the node is not a room ("node is not of type geographic room").
   */

  app.get("/api/v1/room/:id/read_static_details", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const info = await getRoomStaticDetailsInfo(
        spinalAPIMiddleware,
        profileId,
        parseInt(req.params.id, 10)
      );
      return res.json(info);
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  });
};
