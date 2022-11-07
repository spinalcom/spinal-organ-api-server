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
import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { CategoriesAttribute } from './interfacesCategoriesAtrtribut';
import { SpinalNode } from 'spinal-model-graph';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{nodeId}/categoryById/{categoryId}/update:
   *   put:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: update category attribut in specific node
   *     summary: update category attribut
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
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - categoryName
   *             properties:
   *               categoryName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated successfully
   *       400:
   *         description: Bad request
   */
  app.put(
    '/api/v1/node/:nodeId/categoryById/:categoryId/update',
    async (req, res, next) => {
      try {
        let node: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.nodeId, 10)
        );
        let category = await spinalAPIMiddleware.load(
          parseInt(req.params.categoryId, 10)
        );
        const result = await serviceDocumentation._categoryExist(
          node,
          category.getName().get()
        );
        var newCatgoryName = req.body.categoryName;
        if (result === undefined) {
          res.status(400).send('category not found in node');
        } else {
          category.getName().set(newCatgoryName);
        }
      } catch (error) {
        console.log(error);
        res.status(400).send('ko');
      }
      res.json();
    }
  );
};
