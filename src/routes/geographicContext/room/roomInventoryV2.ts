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
import { getRoomInventory } from '../../../utilities/getInventory';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/room/{id}/inventory:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Gets room inventory details ( equipment inventory )
   *     summary: Gets room inventory
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
   *       - in: query
   *         name: includePosition
   *         description: Include position details in the response
   *         required: false
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: onlyDynamicId
   *         description: Only include dynamic ID in the response
   *         required: false
   *         schema:
   *           type: boolean
   * 
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               context:
   *                 type: string
   *               category:
   *                 type: string
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
  app.post("/api/v1/room/:id/inventory", async (req, res, next) => {
    try {
        const profileId = getProfileId(req);
        const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
        const contexts = await graph.getChildren("hasContext");
        const groupContext = contexts.find(e => e.getName().get() === req.body.context);
        if (!groupContext) throw { code: 400, message: "context not found" };
        const includePosition = req.query.includePosition === "true" || false;
        const onlyDynamicId = req.query.onlyDynamicId === "true" || false;

        const reqInfo = {
          ...req.body,
          includePosition,
          onlyDynamicId,
        }

        const inventory = await getRoomInventory(spinalAPIMiddleware,profileId,groupContext, parseInt(req.params.id, 10), reqInfo);
        return res.json(inventory);
    } catch (error) {
        if (error.code && error.message) return res.status(error.code).send(error.message);
        return res.status(400).send(error.message || "ko");
    }
});

};
