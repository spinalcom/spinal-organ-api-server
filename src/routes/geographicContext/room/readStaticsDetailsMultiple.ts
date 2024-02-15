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

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
    
 /**
 * @swagger
 * /api/v1/room/read_static_details_multiple:
 *   post:
 *     security:
 *       - bearerAuth:
 *         - readOnly
 *     description: Read static details of multiple rooms
 *     summary: Gets static details of multiple rooms
 *     tags:
 *       - Geographic Context
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
 *         description: Success - All room static details fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StaticDetailsRoom'
 *       206:
 *         description: Partial Content - Some room static details could not be fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/StaticDetailsRoom'
 *                   - $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 */
app.post('/api/v1/room/read_static_details_multiple', async (req, res, next) => {
  try {
    const profileId = getProfileId(req);
    const dynamicIds = req.body;

    if (!Array.isArray(dynamicIds)) {
      return res.status(400).send('Expected an array of dynamic IDs');
    }

    // Map each dynamicId to a promise
    const promises = dynamicIds.map(dynamicId => getRoomStaticDetailsInfo(spinalAPIMiddleware ,profileId, dynamicId));

    const settledResults = await Promise.allSettled(promises);

    const finalResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            console.error(`Error with dynamicId ${dynamicIds[index]}: ${result.reason}`);
            return {
              dynamicId: dynamicIds[index],
              error: result.reason?.message || result.reason || "Failed to get static details"
            };
        }
    });

    const isGotError = settledResults.some(result => result.status === 'rejected');
    if (isGotError) return res.status(206).json(finalResults);
    return res.status(200).json(finalResults);
  } catch (error) {
    if (error.code && error.message) return res.status(error.code).send(error.message);
    return res.status(400).send(error.message || "ko");
  }
});

};