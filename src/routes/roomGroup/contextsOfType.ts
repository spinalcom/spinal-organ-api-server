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
import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { ContextTree } from './interfacesGroupContexts'
import groupManagerService from "spinal-env-viewer-plugin-group-manager-service"
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/groupContext/contextsOfType/{type}:
*   get:
*     security:
*       - bearerAuth:
*         - readOnly
*     description: Return nodes of type in context
*     summary: Gets a nodes of type with given ID context and Type
*     tags:
*      - Group Context
*     parameters:
*      - in: path
*        name: type
*        required: true
*        schema:
*          type: string
*     responses:
*       200:
*         description: Success
*         content:
*           application/json:
*             schema: 
*               type: array
*               items: 
*                $ref: '#/components/schemas/ContextNodeofTypes'
*       400:
*         description: Bad request
*/

  app.get("/api/v1/groupContext/contextsOfType/:type", async (req, res, next) => {

    const nodes = [];
    try {

      const profileId = getProfileId(req);
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
      const groupContexts = await groupManagerService.getGroupContexts(req.params.type, graph);

      for (let index = 0; index < groupContexts.length; index++) {
        const realNode = SpinalGraphService.getRealNode(groupContexts[index].id)
        const info = {
          dynamicId: realNode._server_id,
          staticId: realNode.getId().get(),
          name: realNode.getName().get(),
          type: realNode.getType().get()
        };
        nodes.push(info);
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(nodes);
  });
};

