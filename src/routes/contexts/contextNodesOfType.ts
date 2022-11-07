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
import { ContextNodeofTypes } from './interfacesContexts'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/context/{id}/nodesOfType/{type}:
*   get:
*     security: 
*       - OauthSecurity: 
*         - readOnly
*     description: Return nodes of type in context
*     summary: Gets a nodes of type with given ID context and Type
*     tags:
*       - Contexts/ontologies
*     parameters:
*      - in: path
*        name: id
*        description: use the dynamic ID
*        required: true
*        schema:
*          type: integer
*          format: int64
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

  app.get("/api/v1/context/:id/nodesOfType/:type", async (req, res, next) => {

    let nodes = [];
    try {
      var context = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      var SpinalContextId = context.getId().get();

      var type_list = await SpinalGraphService.browseAndClassifyByTypeInContext(SpinalContextId, SpinalContextId);
      var model_list = type_list.data[req.params.type];

      if (model_list === undefined) {
        res.status(400).send("type not found in context");
      } else {
        for (let index = 0; index < model_list.length; index++) {
          // hacky way use realnode when fiexd
          const realNode = model_list[index]._parents[0];
          let info: ContextNodeofTypes = {
            dynamicId: realNode._server_id,
            staticId: model_list[index].id.get(),
            name: model_list[index].name.get(),
            type: model_list[index].type.get()
          };
          nodes.push(info);
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("ko");
    }
    res.json(nodes);
  });
};

