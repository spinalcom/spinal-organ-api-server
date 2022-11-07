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

import { NODE_TO_CATEGORY_RELATION } from "spinal-env-viewer-plugin-documentation-service/dist/Models/constants";
import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { CategoriesAttribute } from './interfacesCategoriesAtrtribut'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
* @swagger
* /api/v1/node/{nodeId}/categoryById/{categoryId}/read:
*   get:
*     security: 
*       - OauthSecurity: 
*         - readOnly
*     description: read category attribut in specific node
*     summary: read category attribut
*     tags:
*       - Node Attribut Categories
*     parameters:
*      - in: path
*        name: nodeId
*        description: use the dynamic ID
*        required: true
*        schema:
*          type: integer
*          format: int64
*      - in: path
*        name: categoryId
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
*                $ref: '#/components/schemas/CategoriesAttribute'
*       400:
*         description: Bad request
  */

  app.get("/api/v1/node/:nodeId/categoryById/:categoryId/read", async (req, res, next) => {

    let info: CategoriesAttribute;
    try {

      var node = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10))
      var childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION)
      var category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10))

      for (let index = 0; index < childrens.length; index++) {
        if (childrens[index] === category) {
          info = {
            dynamicId: category._server_id,
            staticId: category.getId().get(),
            name: category.getName().get(),
            type: category.getType().get(),
          };
        }
      }
      if (Object.keys(info).length === 0) {
        res.status(400).send("category not found in node");
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("ko");
    }
    res.json(info);
  })
}
