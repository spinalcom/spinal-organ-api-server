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

import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from "../../utilities/requestUtilities";

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /** 
* @swagger
* /api/v1/node/{idNode}/category/{idCategory}/attribut/create:
*   post:
*     security: 
*       - bearerAuth: 
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

      const node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.IdNode, 10), profileId);
      let test = false
      //@ts-ignore
      SpinalGraphService._addNode(node)
      const category: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.IdCategory, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(category)
      const attributeLabel = req.body.attributeLabel;
      const attributeValue = req.body.attributeValue;
      const attributeType = req.body.attributeType;
      const attributeUnit = req.body.attributeUnit;

      const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);

      for (const children of childrens) {
        if (children.getId().get() === category.getId().get()) {
          test = true;
          const created = await serviceDocumentation.addAttributeByCategoryName(node, category.getName().get(), attributeLabel, attributeValue, attributeType, attributeUnit);
          if (created === undefined) {
            return res.status(400).send("not found");
          }
        }
      }
      if (test === false) {
        return res.status(400).send("this category does not belong to this node");
      }
    } catch (error) {
      if (error.code) return res.status(error.code).send({ message: error.message });
      return res.status(400).send(error.message);
    }
    res.json();
  })
}
