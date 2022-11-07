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

import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Context } from '../../contexts/interfacesContexts'
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/equipementsGroup/list:
 *   get:
 *     security:
 *       - OauthSecurity:
 *         - readOnly
 *     description: Return list of contexts equipements Group
 *     summary: Gets a list of contexts equipements Group
 *     tags:
 *       - Equipements Group
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema: 
 *               type: array
 *               items: 
 *                $ref: '#/components/schemas/Context'
 *       400:
 *         description: Bad request
  */

  app.get("/api/v1/equipementsGroup/list", async (req, res, next) => {

    let nodes = [];
    try {
      var groupContexts = await groupManagerService.getGroupContexts();

      for (let index = 0; index < groupContexts.length; index++) {
        var realNode = SpinalGraphService.getRealNode(groupContexts[index].id)
        if (realNode.getType().get() === "BIMObjectGroupContext") {
          let info: Context = {
            dynamicId: realNode._server_id,
            staticId: realNode.getId().get(),
            name: realNode.getName().get(),
            type: realNode.getType().get()
          };
          nodes.push(info)
        }
      }
    } catch (error) {
      console.error(error);
      res.status(400).send("list of group contexts is not loaded");
    }

    res.send(nodes);

  });
};
