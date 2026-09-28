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
import { getEquipmentListInfo } from '../../../utilities/getEquipmentListInfo';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
   * @swagger
   * /api/v1/room/{id}/equipement_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the equipment of a room (deprecated alias)
   *     description: >-
   *       Kept for backwards compatibility : `equipement` is a historical misspelling. Identical result
   *       to `/api/v1/room/{id}/equipment_list`, which should be used instead.
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
   *         description: The equipment of the room.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Equipement'
   *       400:
   *         description: The room could not be loaded ("list of equipement is not loaded").
   *       401:
   *         description: The profile is not allowed to read this room.
   */
  app.get("/api/v1/room/:id/equipement_list", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const result = await getEquipmentListInfo(spinalAPIMiddleware, profileId, parseInt(req.params.id,10));
      return res.send(result);
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of equipement is not loaded");
    }
  });

  /**
   * @swagger
   * /api/v1/room/{id}/equipment_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the equipment of a room
   *     description: >-
   *       Returns the BIM objects attached to a room through `hasBimObject`, each with its BIM
   *       identifiers (`dbid`, `bimFileId`, `externalId`, `version`).
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
   *         description: The equipment of the room (an empty array if there is none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Equipement'
   *       400:
   *         description: The room could not be loaded ("list of equipement is not loaded").
   *       401:
   *         description: The profile is not allowed to read this room.
   */

  app.get("/api/v1/room/:id/equipment_list", async (req, res, next) => {

    try {
      const profileId = getProfileId(req);
      const result = await getEquipmentListInfo(spinalAPIMiddleware, profileId, parseInt(req.params.id,10));
      return res.send(result);
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of equipement is not loaded");
    }
  });
};
