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

import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from '../../utilities/requestUtilities';
import * as express from 'express';
import { getChildrenNodesInfo } from '../../utilities/getChildrenNodesInfo';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/context/{id}/node/children_multiple:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Retrieve children of multiple nodes based on context and relations.
   *     summary: Retrieve children of multiple nodes based on context and relations
   *     tags:
   *       - Nodes
   *     parameters:
   *       - in: path
   *         name: id
   *         description: Context dynamic Id
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               properties:
   *                 dynamicId:
   *                   type: integer
   *                   format: int64
   *                 relations:
   *                   type: array
   *                   items:
   *                     type: string
   *     responses:
   *       200:
   *         description: Success - All children nodes information for the specified relations fetched successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/BasicNodeMultiple'
   *       206:
   *         description: Partial Content - Some children node information based on the specified relations could not be fetched.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/BasicNodeMultiple'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request - Invalid input or parameters.
   */
  app.post('/api/v1/context/:id/node/children_multiple', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const contextId = req.params.id;
      const nodes: [{ dynamicId: number; relations: string[] }] = req.body;

      if (!Array.isArray(nodes)) {
        return res
          .status(400)
          .send('Invalid relations format; an array is expected');
      }

      const promises = nodes.map(async (node) => {
        const children = await getChildrenNodesInfo(
          spinalAPIMiddleware,
          profileId,
          node.dynamicId,
          node.relations,
          parseInt(contextId,10)
        );
        return {
          dynamicId: node.dynamicId,
          nodes: children,
        };
      });
      const settledResults = await Promise.allSettled(promises);

      const finalResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(
            `Error with id ${nodes[index].dynamicId}: ${result.reason}`
          );
          return {
            dynamicId: nodes[index].dynamicId,
            error:
              result.reason?.message ||
              result.reason ||
              'Failed to get Children',
          };
        }
      });
      const isGotError = settledResults.some(
        (result) => result.status === 'rejected'
      );
      if (isGotError) {
        return res.status(206).json(finalResults);
      }
      return res.status(200).json(finalResults);
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(400).send('An error occurred while fetching children.');
    }
  });
};
