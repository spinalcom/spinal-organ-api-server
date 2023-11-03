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
import { getCategoryNameInfo } from '../../utilities/getCategoryNameInfo';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{nodeId}/categoryByName/{categoryName}/read:
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
   *        name: categoryName
   *        required: true
   *        schema:
   *          type: string
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

  app.get(
    '/api/v1/node/:nodeId/categoryByName/:categoryName/read',
    async (req, res, next) => {
      try {
        const info = await getCategoryNameInfo(
          spinalAPIMiddleware,
          parseInt(req.params.nodeId, 10),
          req.params.categoryName
        );
        res.json(info);
      } catch (error) {
        console.log(error);

        res.status(400).send(error.message || 'ko');
      }
    }
  );
};
