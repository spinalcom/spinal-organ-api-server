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
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { NodeAttribut, Attributs } from './interfacesAttributs';

import * as express from 'express';

import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from "../../utilities/requestUtilities";

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/node/{idNode}/category/{idCategory}/attribut/{attributName}/update:
   *   put:
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
   *       - in: path
   *         name: attributName
   *         required: true
   *         schema:
   *           type: string
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

  app.put(
    '/api/v1/node/:IdNode/category/:IdCategory/attribut/:attributName/update',
    async (req, res, next) => {
      try {
        const profileId = getProfileId(req);

        var nodes = [];
        const node: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.IdNode, 10), profileId
        );
        const category: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.IdCategory, 10), profileId
        );
        const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);
        for (const children of childrens) {
          if (children.getId().get() === category.getId().get()) {
            const attributes = await category.getElement();
            for (let index = 0; index < attributes.length; index++) {
              const element = attributes[index];
              if (element.label.get() === req.params.attributName) {
                element.label.set(req.body.attributeLabel);
                element.value.set(req.body.attributeValue);
                element.type.set(req.body.attributeType);
                element.unit.set(req.body.attributeUnit);
                break;
              }
            }
          }
        }

        for (const child of childrens) {
          const attributs = await child.element.load();
          const info: NodeAttribut = {
            dynamicId: child._server_id,
            staticId: child.getId().get(),
            name: child.getName().get(),
            type: child.getType().get(),
            attributs: attributs.get(),
          };
          nodes.push(info);
        }
      } catch (error) {
        if (error.code) return res.status(error.code).send({ message: error.message });
        return res.status(400).send('ko');
      }
      res.json(nodes);
    }
  );
};
