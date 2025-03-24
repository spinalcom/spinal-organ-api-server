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
import { getRoomInventory } from '../../../utilities/getRoomInventory';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
 * @swagger
 * /api/v1/room/{id}/inventory:
 *   get:
 *     security:
 *       - bearerAuth:
 *         - readOnly
 *     description: Reads details of a room including its inventory
 *     summary: Gets inventory details of a room ( deprecated )
 *     tags:
 *       - Geographic Context
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Use the dynamic ID of the room
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryRoomDetails'
 *       400:
 *         description: Bad request
 */
  app.get("/api/v1/room/:id/inventory", async (req, res, next) => {
    try {
        const profileId = getProfileId(req);
        const inventory = await getRoomInventory(spinalAPIMiddleware,profileId, parseInt(req.params.id, 10));
        return res.json(inventory);
    } catch (error) {
        if (error.code && error.message) return res.status(error.code).send(error.message);
        return res.status(400).send(error.message || "ko");
    }
});
};
