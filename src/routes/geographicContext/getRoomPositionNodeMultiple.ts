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

import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { getRoomPosition } from '../../utilities/getPosition';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

/**
 * @swagger
 * /api/v1/room/get_position_multiple:
 *   post:
 *     security: 
 *       - OauthSecurity: 
 *         - readOnly
 *     description: Return position for multiple rooms
 *     summary: Gets position for multiple rooms
 *     tags:
 *      - Geographic Context
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: integer
 *               format: int64
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoomPosition'
 *       400:
 *         description: Bad request
 */
app.post("/api/v1/room/get_position_multiple", async (req, res, next) => {
  const results = [];
  try {
    const ids: number[] = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).send("Expected an array of IDs.");
    }

    for (const id of ids) {
      const position = await getRoomPosition(spinalAPIMiddleware, id);
      results.push(position);
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(400).send(error.message || "Failed to get position");
  }
});

}
