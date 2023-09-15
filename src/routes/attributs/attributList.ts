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
import type { NodeAttribut } from './interfacesAttributs';
import type { SpinalNode } from 'spinal-model-graph';
import { getAttributeListInfo } from '../../utilities/getAttributeListInfo'

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  

  app.get('/api/v1/node/:id/attributsList', async (req, res, next) => {
    try {
      let node: SpinalNode = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10)
      );
      let childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);
      const prom = childrens.map(async (child): Promise<NodeAttribut> => {
        let attributs = await child.element.load();
        let info: NodeAttribut = {
          dynamicId: child._server_id,
          staticId: child.getId().get(),
          name: child.getName().get(),
          type: child.getType().get(),
          attributs: attributs.get(),
        };
        return info;
      });
      const json = await Promise.all(prom);
      return res.json(json);
    } catch (error) {
      console.log(error);
      return res.status(400).send('ko');
    }
  });


  /**
   * @swagger
   * /api/v1/node/{id}/attribute_list:
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
  app.get('/api/v1/node/:id/attribute_list', async (req, res, next) => {
    try {
        const attributes = await getAttributeListInfo(spinalAPIMiddleware, parseInt(req.params.id, 10));
        res.json(attributes);
    } catch (error) {
        console.log(error);
        res.status(400).send('ko');
    }
});

/**
* @swagger
* /api/v1/node/attribute_list_multiple:
*   post:
*     security:
*       - OauthSecurity:
*         - readOnly
*     description: Returns a list of attributes for multiple nodes
*     summary: Get list of attributes for multiple nodes
*     tags:
*       - Node Attributs
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: array
*             items:
*               type: integer
*               format: int64
*           example:
*             - 1
*             - 2
*     responses:
*       200:
*         description: Success
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: array
*                 items:
*                   $ref: '#/components/schemas/NodeAttribut'
*       400:
*         description: Bad request
*       500:
*         description: Server error
*/
app.post('/api/v1/node/attribute_list_multiple', async (req, res, next) => {
  const results = [];
  try {
      const ids: number[] = req.body;
      if (!Array.isArray(ids)) {
          return res.status(400).send("Expected an array of IDs.");
      }

      for (const id of ids) {
          const attributes = await getAttributeListInfo(spinalAPIMiddleware, id);
          results.push(attributes);
      }
      
      res.json(results);
  } catch (error) {
      console.error(error);
      return res.status(400).send("An error occurred while fetching attributes list.");
  }
});

};


