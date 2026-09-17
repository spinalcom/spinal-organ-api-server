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
  addSpinalUserToSpinalUserGroup,
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
   * /api/v1/user-group/context/{contextId}/group/{groupId}/user:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Add users to a specific user group within a user group context
   *     description: Add users to a specific user group within a user group context
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
   *       - in: path
   *         name: groupId
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *         description: The ID of the user group to retrieve
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userDynamicIds
   *             properties:
   *               userDynamicIds:
   *                 type: array
   *                 items:
   *                   type: number
   *                   minLength: 1
   *     responses:
   *       200:
   *         description: Successfully added users to the user group
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 userSuccessfullyAdded:
   *                   type: array
   *                   items:
   *                     type: integer
   *                     format: int64
   *                   description: array of dynamic IDs of the users that were successfully added to the user group
   *                 userFailedToAdd:
   *                   type: array
   *                   items:
   *                     type: integer
   *                     format: int64
   *                   description: array of dynamic IDs of the users that failed to be added to the user group
   *       401:
   *         description: no graph found for the user
   */
  app.post(
    '/api/v1/user-group/context/:contextId/group/:groupId/user',
    validate({
      params: z.object({
        contextId: z.coerce.number().positive(),
        groupId: z.coerce.number().positive(),
      }),
      body: z.strictObject({
        userDynamicIds: z.array(z.coerce.number().positive()).min(1),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };

        try {
          const userGroupContexts = await getSpinalUserGroupContext(userGraph);
          const { contextId, groupId } = req.params;

          const userGroupContext = userGroupContexts.find(
            (context) => context._server_id === contextId
          );
          if (!userGroupContext)
            throw {
              code: 404,
              message: `No user group context found with id ${req.params.contextId}`,
            };

          const groupNode = await loadAndValidateNode(
            spinalAPIMiddleware,
            groupId,
            profileId,
            SPINAL_USER_GROUP_TYPE
          );

          const results: {
            userSuccessfullyAdded: number[];
            userFailedToAdd: number[];
          } = { userSuccessfullyAdded: [], userFailedToAdd: [] };
          // Process req.body.userDynamicIds in batches of 25
          for (let i = 0; i < req.body.userDynamicIds.length; i += 25) {
            const batch = req.body.userDynamicIds.slice(i, i + 25);
            await Promise.all(
              batch.map(async (userId) => {
                try {
                  const userNode = await loadAndValidateNode(
                    spinalAPIMiddleware,
                    userId,
                    profileId,
                    SPINAL_USER_TYPE
                  );
                  await addSpinalUserToSpinalUserGroup(
                    userGroupContext,
                    groupNode,
                    userNode
                  );

                  results.userSuccessfullyAdded.push(userId);
                } catch (error) {
                  results.userFailedToAdd.push(userId);
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
