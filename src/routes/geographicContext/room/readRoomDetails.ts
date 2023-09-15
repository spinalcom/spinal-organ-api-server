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

import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Room } from '../interfacesGeoContext';
import {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import { getRoomDetailsInfo } from '../../../utilities/getRoomDetailsInfo';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/room/{id}/read_details:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: read details of room
   *     summary: Gets details of room
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/RoomDetails'
   *       400:
   *         description: Bad request
   */

  app.get("/api/v1/room/:id/read_details", async (req, res, next) => {
    try {
        const details = await getRoomDetailsInfo(spinalAPIMiddleware, parseInt(req.params.id, 10));
        res.json(details);
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || "ko");
    }
});

  /**
   * @swagger
   * /api/v1/room/read_details_multiple:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Read details of multiple rooms
   *     summary: Gets details of multiple rooms
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
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/RoomDetails'
   *       400:
   *         description: Bad request
   */
  app.post('/api/v1/room/read_details_multiple', async (req, res, next) => {
    const results = [];
    try {
      const ids: number[] = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).send('Expected an array of IDs.');
      }

      for (const id of ids) {
        const details = await getRoomDetailsInfo(spinalAPIMiddleware, id);
        results.push(details);
      }

      res.json(results);
    } catch (error) {
      console.error(error);
      return res
        .status(400)
        .send(
          error.message || 'An error occurred while fetching room details.'
        );
    }
  });
};
