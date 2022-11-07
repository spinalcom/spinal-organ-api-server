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

import SpinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import {spinalNomenclatureService} from "spinal-env-viewer-plugin-nomenclature-service"


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: SpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/nomenclatureGroup/create:
 *   post:
 *     security:
 *       - OauthSecurity:
 *         - read
 *     description: create nomenclature Group context
 *     summary: create nomenclature Group context
 *     tags:
 *       - Nomenclature Group
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomenclatureContextName
 *             properties:
 *                nomenclatureContextName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Create Successfully
 *       400:
 *         description: Bad request
*/


  app.post("/api/v1/nomenclatureGroup/create", async (req, res, next) => {

    try {
      let context = await spinalNomenclatureService.createOrGetContext(req.body.nomenclatureContextName)
      var info = {
        dynamicId: context._server_id,
        staticId: context.getId().get(),
        name: context.getName().get(),
        type: context.getType().get(),
        }
        } catch (error) {
      console.error(error)
      res.status(400).send("ko")
    }
    res.json(info);
  })
}
