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
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import { NodeAttribut, Attributs } from './interfacesAttributs'
import { FileSystem } from 'spinal-core-connectorjs_type';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/node/{id}/attributsList:
*   get:
*     security: 
*       - OauthSecurity: 
*         - readOnly
*     description: Returns list of attributs
*     summary: Get list of attributs
*     tags:
*       - Node Attributs
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
*               type: array
*               items: 
*                $ref: '#/components/schemas/NodeAttribut'
*       400:
*         description: Bad request
  */


  app.get("/api/v1/node/:id/attributsList", async (req, res, next) => {
    let nodes = [];

    try {
      let node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      let childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);
      for (const child of childrens) {
        let attributs = await child.element.load();
        let info: NodeAttribut = {
          dynamicId: child._server_id,
          staticId: child.getId().get(),
          name: child.getName().get(),
          type: child.getType().get(),
          attributs: attributs.get()
        };
        nodes.push(info);
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send("ko");
    }

    res.json(nodes);
  });
};










