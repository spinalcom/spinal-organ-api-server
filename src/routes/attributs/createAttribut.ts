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
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service'
import { NODE_TO_CATEGORY_RELATION } from "spinal-env-viewer-plugin-documentation-service/dist/Models/constants";
import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'

import * as express from 'express';
import { getProfileId } from '../../utilities/requestUtilities';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /** 
* @swagger
* /api/v1/node/{idNode}/category/{idCategory}/attribut/create:
*   post:
*     security: 
*       - OauthSecurity: 
*         - read
*     description: Create attribute
*     summary: create an attribute
*     tags:
*       - Node Attributs
*     parameters:
*       - in: path
*         name: idNode
*         description: use the dynamic ID
*         required: true
*         schema:
*           type: integer
*           format: int64
*       - in: path
*         name: idCategory
*         description: use the dynamic ID
*         required: true
*         schema:
*           type: integer
*           format: int64
*     requestBody:
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - attributeLabel
*               - attributeValue
*               - attributeType
*               - attributeUnit
*             properties:
*               attributeLabel:
*                 type: string
*               attributeValue:
*                 type: string
*               attributeType:
*                 type: string
*               attributeUnit:
*                 type: string
*     responses:
*       200:
*         description: Create Successfully
*       400:
*         description: Bad request
*/

  app.post("/api/v1/node/:IdNode/category/:IdCategory/attribut/create", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      let node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.IdNode, 10), profileId);
      let category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.IdCategory, 10), profileId);
      let attributeLabel = req.body.attributeLabel;
      let attributeValue = req.body.attributeValue;
      let attributeType = req.body.attributeType;
      let attributeUnit = req.body.attributeUnit;

      let childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION)
      for (let index = 0; index < childrens.length; index++) {
        if (childrens[index]._server_id === category._server_id) {
          const attribute = await serviceDocumentation.addAttributeByCategoryName(node, category.getName().get(), attributeLabel, attributeValue, attributeType, attributeUnit)
          return res.status(200).send(attribute.get());
        }
        // else {
        // return res.status(500).send(error.message);
        // }
      }

      return res.status(400).send("Category not found")

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      return res.status(500).send(error.message);
    }
  })
}
