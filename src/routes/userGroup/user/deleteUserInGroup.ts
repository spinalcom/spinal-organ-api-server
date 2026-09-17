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
  removeSpinalUserFromSpinalUserGroup,
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
   * /api/v1/user-group/group/{groupId}/user/{userId}:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Remove user from a specific user group
   *     description: Remove user from a specific user group
   *     tags:
   *       - User Group
   *     parameters:
   *       - in: path
   *         name: groupId
   *         description: The ID of the user group to retrieve
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: userId
   *         description: The ID of the user to remove from the user group
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: query
   *         name: removeControlPoints
   *         description: "Whether to also remove the user from any control points associated with the user group (default: true)"
   *         required: false
   *         schema:
   *           type: boolean
   *           default: true
   *     responses:
   *       204:
   *         description: Successfully removed users from the user group
   *       401:
   *         description: no graph found for the user
   */
  app.delete(
    '/api/v1/user-group/group/:groupId/user/:userId',
    validate({
      params: z.object({
        groupId: z.coerce.number().positive(),
        userId: z.coerce.number().positive(),
      }),
      query: z.object({
        removeControlPoints: z.coerce.boolean().optional().default(true),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };

        try {
          const { groupId, userId } = req.params;

          const groupNode = await loadAndValidateNode(
            spinalAPIMiddleware,
            groupId,
            profileId,
            SPINAL_USER_GROUP_TYPE
          );

          const userNode = await loadAndValidateNode(
            spinalAPIMiddleware,
            userId,
            profileId,
            SPINAL_USER_TYPE
          );

          await removeSpinalUserFromSpinalUserGroup(
            groupNode,
            userNode,
            req.query.removeControlPoints
          );
          res.status(204).send();
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to remove user from the user group',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while removing user from the user group'
          );
      }
    }
  );
};
