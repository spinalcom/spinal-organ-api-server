/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import type { Express } from 'express';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { z } from 'zod';
import validate from 'express-zod-safe';
import {
  getGroupingCategory,
  getSpinalUserGroupContext,
} from 'spinal-model-user-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { createBasicNodeSync } from '../../../utilities/createBasicNode';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user-group/context/{contextId}/category:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Get all the user group categories of a user group context
   *     description: Get all the user group categories of a user group context
   *     tags:
   *       - User Group
   *     parameters:
   *       - in: path
   *         name: contextId
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *         description: The ID of the user group context to retrieve
   *     responses:
   *       200:
   *         description: Successfully retrieved the user group categories
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 $ref: '#/components/schemas/BasicNodeWithColor'
   *       401:
   *         description: no graph found for the user
   */
  app.get(
    '/api/v1/user-group/context/:contextId/category',
    validate({
      params: z.object({ contextId: z.coerce.number().positive() }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };

        try {
          const userGroupContexts = await getSpinalUserGroupContext(userGraph);

          const userGroupContext = userGroupContexts.find(
            (context) => context._server_id === req.params.contextId
          );
          if (!userGroupContext)
            throw {
              code: 404,
              message: `No user group context found with id ${req.params.contextId}`,
            };

          const categories = await getGroupingCategory(userGroupContext);
          const result = await Promise.all(
            categories.map((category) =>
              createBasicNodeSync(category, ['color'] as const)
            )
          );
          res.status(200).json(result);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to retrieve user group categories',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while retrieving the user group categories'
          );
      }
    }
  );
};
