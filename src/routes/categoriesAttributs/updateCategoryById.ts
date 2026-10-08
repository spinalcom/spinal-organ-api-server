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
// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { CategoriesAttribute } from '../attributs/CategoriesAttribute';
import { getProfileId } from '../../utilities/requestUtilities';
import { SpinalNode } from 'spinal-model-graph';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{nodeId}/categoryById/{categoryId}/update:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Rename an attribute category of a node, by ID
   *     description: >-
   *       Renames a category, after checking that it is attached to the given node. Only the name
   *       changes; the attributes the category holds are untouched.
   *
   *
   *       A successful call answers **200 with an empty body**.
   *     tags:
   *       - Node Attribut Categories
   *     parameters:
   *      - in: path
   *        name: nodeId
   *        description: Dynamic ID of the node.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: categoryId
   *        description: Dynamic ID of the category to rename.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - categoryName
   *             properties:
   *               categoryName:
   *                 type: string
   *                 description: The new name of the category.
   *     responses:
   *       200:
   *         description: The category was renamed. The body is empty.
   *       400:
   *         description: The category is not attached to this node ("category not found in node").
   *       401:
   *         description: The profile is not allowed to write on this node.
   *       500:
   *         description: The node or the category could not be loaded.
   */
  app.put(
    '/api/v1/node/:nodeId/categoryById/:categoryId/update',
    async (req, res, next) => {
      try {
        const profileId = getProfileId(req);
        const node: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.nodeId, 10),
          profileId
        );
        const category = await spinalAPIMiddleware.load(
          parseInt(req.params.categoryId, 10),
          profileId
        );
        const result = await serviceDocumentation._categoryExist(
          node,
          category.getName().get()
        );
        const newCatgoryName = req.body.categoryName;
        if (result === undefined) {
          res.status(400).send('category not found in node');
        } else {
          category.getName().set(newCatgoryName);
        }
      } catch (error) {
        if (error.code && error.message)
          return res.status(error.code).send(error.message);
        res.status(500).send(error.message);
      }
      res.json();
    }
  );
};
