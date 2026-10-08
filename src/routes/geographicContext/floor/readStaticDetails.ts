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
import { getFloorStaticDetailsInfo } from '../../../utilities/getStaticDetailsInfo';
import { getTicketListInfo } from '../../../utilities/getTicketListInfo';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/floor/{id}/read_static_details:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get everything known about a floor
   *     description: >-
   *       The full read of a floor in one call : its identity, its attribute categories with their
   *       attributes, its control points, its BMS endpoints with their current values, and `tickets`,
   *       the tickets declared directly on the floor node.
   *
   *
   *       Only the tickets of the floor node itself are returned; those declared on its rooms or their
   *       equipment are not collected. The node must be of type `geographicFloor`.
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the floor.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The complete static description of the floor, plus its tickets.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/StaticDetailsFloor'
   *       401:
   *         description: The profile is not allowed to read this floor.
   *       500:
   *         description: The floor could not be loaded, or the node is not a `geographicFloor`.
   */

  app.get("/api/v1/floor/:id/read_static_details", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const info = await getFloorStaticDetailsInfo(
        spinalAPIMiddleware,
        profileId,
        parseInt(req.params.id,10)
      );

      const ticketList = await getTicketListInfo(
        spinalAPIMiddleware,
        profileId,
        parseInt(req.params.id,10)
      );

      const merge = { ...info, tickets: ticketList };
      return res.json(merge);
    } catch (error) {
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  });
};
