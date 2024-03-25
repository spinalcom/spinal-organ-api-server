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

import * as express from 'express';
import { getNodeInfo } from '../../utilities/getNodeInfo';
import { getProfileId } from '../../utilities/requestUtilities';
import { Node } from './interfacesNodes';
import { SpinalNode } from 'spinal-model-graph';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/read_multiple:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns an array of node objects with parent and children relation
   *     summary: Gets Multiple Nodes
   *     tags:
   *       - Nodes
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
   *         description: Success - All nodes fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Node'
   *       206:
   *         description: Partial Content - Some nodes could not be fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/Node'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request
   */

  app.post('/api/v1/node/read_multiple', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const ids: number[] = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).send('Expected an array of IDs.');
      }

      // Map each id to a promise
      const promises = ids.map((id) =>
        getNodeInfo(spinalAPIMiddleware, profileId, id)
      );

      const settledResults = await Promise.allSettled(promises);

      const finalResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Error with id ${ids[index]}: ${result.reason}`);
          return {
            dynamicId: ids[index],
            error:
              result.reason?.message ||
              result.reason ||
              'Failed to get Node info',
          };
        }
      });

      const isGotError = settledResults.some(
        (result) => result.status === 'rejected'
      );
      if (isGotError) {
        return res.status(206).json(finalResults); // If any errors, send 206 Partial Content
      }
      return res.status(200).json(finalResults); // If all successful, send 200 OK
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      return res
        .status(500)
        .send(error.message || 'An error occurred while fetching nodes.');
    }
  });
};
