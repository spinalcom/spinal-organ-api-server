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


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

/**
 * @swagger
 * /api/v1/room/get_position_multiple:
 *   post:
 *     security: 
 *       - bearerAuth: 
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
 *         description: Success - All room positions fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoomPosition'
 *       206:
 *         description: Partial Content - Some room positions could not be fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/RoomPosition'
 *                   - $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 */
app.post("/api/v1/room/get_position_multiple", async (req, res, next) => {
    try {
        const profileId = getProfileId(req);
        const ids = req.body;
  
        if (!Array.isArray(ids)) {
            return res.status(400).send("Expected an array of IDs.");
        }
  
        // Map each id to a promise
        const promises = ids.map(id => getRoomPosition(spinalAPIMiddleware,profileId, id));
  
        const settledResults = await Promise.allSettled(promises);
  
        const finalResults = settledResults.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.error(`Error with id ${ids[index]}: ${result.reason}`);
                return {
                  id: ids[index],
                  error: result.reason?.message || result.reason || "Failed to get position"
                };
            }
        });
  
        const isGotError = settledResults.some(result => result.status === 'rejected');
        if(isGotError) return res.status(206).json(finalResults);
        return res.status(200).json(finalResults);
    } catch (error) {
        if (error.code && error.message) return res.status(error.code).send(error.message);
        res.status(400).send(error.message || "Failed to get position");
    }
  });

}
