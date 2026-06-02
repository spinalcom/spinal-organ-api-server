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
  getSpinalUserFromSpinalUserGroup,
  getSpinalUserGroupContext,
  SPINAL_USER_GROUP_TYPE,
} from 'spinal-model-user-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';
import { getUserData } from '../../../utilities/getUserData';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user-group/context/{contextId}/group/{groupId}/user:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Get all the users in a specific user group within a user group context
   *     description: Get all the users in a specific user group within a user group context
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
   *       - in: query
   *         name: attributes
   *         required: false
   *         schema:
   *           type: boolean
   *           description: add the attributes of the user in the response
   *           default: false
   *       - in: query
   *         name: groups
   *         required: false
   *         schema:
   *           type: boolean
   *           description: add the groups which the user belongs to in the response
   *           default: false
   *       - in: query
   *         name: organizations
   *         required: false
   *         schema:
   *           type: boolean
   *           description: add the organizations which the user belongs to in the response
   *           default: false
   *     responses:
   *       200:
   *         description: Successfully retrieved the users in the user group
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 $ref: '#/components/schemas/IUser'
   *       401:
   *         description: no graph found for the user
   */
  app.get(
    '/api/v1/user-group/context/:contextId/group/:groupId/user',
    validate({
      params: z.object({
        contextId: z.coerce.number().positive(),
        groupId: z.coerce.number().positive(),
      }),
      query: z.object({
        attributes: z.coerce.boolean().optional().default(false),
        groups: z.coerce.boolean().optional().default(false),
        organizations: z.coerce.boolean().optional().default(false),
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
          const userNodes = await getSpinalUserFromSpinalUserGroup(
            groupNode,
            userGroupContext
          );

          const result = await Promise.all(
            userNodes.map((userNode) =>
              getUserData(
                userNode,
                req.query.attributes,
                req.query.groups,
                req.query.organizations
              )
            )
          );
          res.status(200).json(result);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to retrieve user from the user group',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while retrieving the user from the user group'
          );
      }
    }
  );
};
