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
  moveSpinalUserFromSpinalUserGroup,
  getSpinalUserGroupContext,
  SPINAL_USER_GROUP_TYPE,
  SPINAL_USER_TYPE,
} from 'spinal-model-user-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user-group/user/move:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Add users to a specific user group within a user group context
   *     description: Add users to a specific user group within a user group context
   *     tags:
   *       - User Group
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *            type: object
   *            required:
   *             - query
   *            properties:
   *             query:
   *               type: array
   *               minLength: 1
   *               items:
   *                 type: object
   *                 required:
   *                   - originGroupDynamicId
   *                   - targetContextDynamicId
   *                   - targetGroupDynamicId
   *                   - userDynamicId
   *                 properties:
   *                   originGroupDynamicId:
   *                     type: integer
   *                     minimum: 1
   *                     format: int64
   *                     description: dynamic ID of the user group from which the user will be moved
   *                   targetContextDynamicId:
   *                     type: integer
   *                     minimum: 1
   *                     format: int64
   *                     description: dynamic ID of the target context to which the user will be moved
   *                   targetGroupDynamicId:
   *                     type: integer
   *                     minimum: 1
   *                     format: int64
   *                     description: dynamic ID of the target user group to which the user will be moved
   *                   userDynamicId:
   *                     type: integer
   *                     minimum: 1
   *                     format: int64
   *                     description: dynamic ID of the user to be moved
   *     responses:
   *       200:
   *         description: Successfully added users to the user group
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 userSuccessfullyMoved:
   *                   type: array
   *                   items:
   *                     type: integer
   *                     format: int64
   *                   description: array of dynamic IDs of the users that were successfully moved to the target user group
   *                 userFailedToMove:
   *                   type: array
   *                   items:
   *                     type: integer
   *                     format: int64
   *                   description: array of dynamic IDs of the users that failed to be moved to the target user group
   *       401:
   *         description: no graph found for the user
   */
  app.post(
    '/api/v1/user-group/user/move',
    validate({
      body: z.strictObject({
        query: z
          .array(
            z.strictObject({
              originGroupDynamicId: z.coerce.number().positive(),
              targetContextDynamicId: z.coerce.number().positive(),
              targetGroupDynamicId: z.coerce.number().positive(),
              userDynamicId: z.coerce.number().positive(),
            })
          )
          .min(1),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };

        try {
          const results: {
            userSuccessfullyMoved: number[];
            userFailedToMove: number[];
          } = { userSuccessfullyMoved: [], userFailedToMove: [] };
          const { query } = req.body;
          const userGroupContexts = await getSpinalUserGroupContext(userGraph);

          // Process query in batches of 25
          for (let i = 0; i < query.length; i += 25) {
            const batch = query.slice(i, i + 25);
            await Promise.all(
              batch.map(async (moveRequest) => {
                const {
                  originGroupDynamicId,
                  targetContextDynamicId,
                  targetGroupDynamicId,
                  userDynamicId,
                } = moveRequest;
                try {
                  const targetuserGroupContext = userGroupContexts.find(
                    (context) => context._server_id === targetContextDynamicId
                  );
                  if (!targetuserGroupContext) throw targetuserGroupContext;
                  const userNode = await loadAndValidateNode(
                    spinalAPIMiddleware,
                    userDynamicId,
                    profileId,
                    SPINAL_USER_TYPE
                  );
                  const originGroupNode = await loadAndValidateNode(
                    spinalAPIMiddleware,
                    originGroupDynamicId,
                    profileId,
                    SPINAL_USER_GROUP_TYPE
                  );
                  const targetGroupNode = await loadAndValidateNode(
                    spinalAPIMiddleware,
                    targetGroupDynamicId,
                    profileId,
                    SPINAL_USER_GROUP_TYPE
                  );
                  await moveSpinalUserFromSpinalUserGroup(
                    userNode,
                    originGroupNode,
                    targetGroupNode,
                    targetuserGroupContext
                  );
                  results.userSuccessfullyMoved.push(userDynamicId);
                } catch (error) {
                  results.userFailedToMove.push(userDynamicId);
                }
              })
            );
          }
          res.status(200).json(results);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to add users to the user group',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while adding users to the user group'
          );
      }
    }
  );
};
