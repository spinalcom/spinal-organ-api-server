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
import { Equipement } from '../interfacesGeoContext';
import { SpinalNode } from 'spinal-model-graph';
import {
  SpinalContext,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { getEquipmentListInfo } from '../../../utilities/getEquipmentListInfo';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {

  /**
 * @swagger
 * /api/v1/room/equipment_list_multiple:
 *   post:
 *     security: 
 *       - OauthSecurity: 
 *         - readOnly
 *     description: Return list of equipment for multiple rooms
 *     summary: Gets a list of equipment for multiple rooms
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
 *                 type: object
 *                 properties:
 *                   dynamicId:
 *                     type: integer
 *                   equipments:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Equipement'
 *       400:
 *         description: Bad request
 */
app.post("/api/v1/room/equipment_list_multiple", async (req, res, next) => {
  const results = [];
  try {
      const ids: number[] = req.body;
      if (!Array.isArray(ids)) {
          return res.status(400).send("Expected an array of IDs.");
      }

      for (const id of ids) {
          const equipmentList = await getEquipmentListInfo(spinalAPIMiddleware, id);
          results.push({dynamicId: id, equipments: equipmentList});
      }
      
      res.json(results);
  } catch (error) {
      console.error(error);
      return res.status(400).send(error.message || "An error occurred while fetching equipment lists.");
  }
});

};
