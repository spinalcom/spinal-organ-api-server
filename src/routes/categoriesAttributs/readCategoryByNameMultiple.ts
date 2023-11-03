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
   * /api/v1/node/categoryByName/{categoryName}/read_multiple:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Read category attribute for multiple nodes
   *     summary: Read category attribute for multiple nodes
   *     tags:
   *      - Node Attribut Categories
   *     parameters:
   *      - in: path
   *        name: categoryName
   *        required: true
   *        schema:
   *          type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: integer
   *               format: int64
   *     responses:
   *       200:
   *         description: Success - All attribute nodes info fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CategoriesAttributeMultiple'
   *       206:
   *         description: Partial Content - Some attribute info could not be fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/CategoriesAttributeMultiple'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request
   */

  app.post(
    '/api/v1/node/categoryByName/:categoryName/read_multiple',
    async (req, res, next) => {
      try {
        const ids = req.body;

        if (!Array.isArray(ids)) {
          return res.status(400).send('Expected an array of IDs.');
        }

        // Map each id to a promise
        const promises = ids.map(async (id) => {
            const info = await getCategoryNameInfo(spinalAPIMiddleware, id, req.params.categoryName)
            return {dynamicId: id, categoryAttribute:info}
            }
        );

        const settledResults = await Promise.allSettled(promises);

        const finalResults = settledResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            console.error(`Error with id ${ids[index]}: ${result.reason}`);
            return {
              id: ids[index],
              error:
                result.reason?.message ||
                result.reason ||
                'Failed to get Category',
            };
          }
        });

        const isGotError = settledResults.some(
          (result) => result.status === 'rejected'
        );
        if (isGotError) return res.status(206).json(finalResults);
        return res.status(200).json(finalResults);
      } catch (error) {
        console.error(error);
        return res
          .status(400)
          .send(error.message || 'Failed to get categories');
      }
    }
  );
};
