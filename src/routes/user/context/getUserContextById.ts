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

import { z } from 'zod';
import validate from 'express-zod-safe';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { Express } from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { getSpinalUserContexts } from 'spinal-model-user-service';
import { createBasicNodeSync } from '../../../utilities/createBasicNode';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user/context/{contextId}:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: Get a specific User Context by its dynamic ID
   *     summary: Get a specific User Context by its dynamic ID
   *     tags:
   *       - User
   *     parameters:
   *       - in: path
   *         name: contextId
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *           description: dynamic ID of the user context to retrieve
   *     responses:
   *       200:
   *         description: Retrieve Successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: Bad request - Invalid input or parameters
   *       404:
   *         description: User context not found
   *       401:
   *         description: no graph found for the user
   */
  app.get(
    '/api/v1/user/context/:contextId',
    validate({
      params: z.strictObject({
        contextId: z.coerce.number().positive(),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };
        const { contextId } = req.params;

        try {
          const userContexts = await getSpinalUserContexts(userGraph);
          const userContext = userContexts.find(
            (context) => context._server_id === contextId
          );
          if (!userContext)
            throw {
              code: 404,
              message: `No user context found with the ID ${contextId}`,
            };
          const result = await createBasicNodeSync(userContext.context);
          res.status(200).json(result);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to retrieve user context',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while retrieving the user context'
          );
      }
    }
  );
};
