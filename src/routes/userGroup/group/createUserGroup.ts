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
  createSpinalUserGroup,
  getGroupingCategory,
  getSpinalUserGroup,
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
   * /api/v1/user-group/context/{contextId}/category/{categoryId}/group:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Create a new user group in a specific category within a user group context
   *     description: Create a new user group in a specific category within a user group context
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
   *         name: categoryId
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *         description: The ID of the user group category to retrieve
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 maxLength: 200
   *                 minLength: 1
   *                 description: name of the user group to create
   *               color:
   *                 type: string
   *                 pattern: '^#([A-Fa-f0-9]{6})$'
   *                 description: Hexadecimal color code for the user group (e.g., #RRGGBB)
   *     responses:
   *       201:
   *         description: Successfully created the user group
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BasicNodeWithColor'
   *       401:
   *         description: no graph found for the user
   */
  app.post(
    '/api/v1/user-group/context/:contextId/category/:categoryId/group',
    validate({
      params: z.object({
        contextId: z.coerce.number().positive(),
        categoryId: z.coerce.number().positive(),
      }),
      body: z.strictObject({
        name: z.string().max(200).min(1),
        color: z
          .string()
          .regex(/^#([A-Fa-f0-9]{6})$/)
          .optional(),
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
          const { contextId, categoryId } = req.params;

          const userGroupContext = userGroupContexts.find(
            (context) => context._server_id === contextId
          );
          if (!userGroupContext)
            throw {
              code: 404,
              message: `No user group context found with id ${req.params.contextId}`,
            };

          const categories = await getGroupingCategory(userGroupContext);
          const category = categories.find(
            (cat) => cat._server_id === categoryId
          );
          if (!category)
            throw {
              code: 404,
              message: `No user group category found with id ${req.params.categoryId} in context ${req.params.contextId}`,
            };
          const { name, color } = req.body;
          const group = await createSpinalUserGroup(
            userGroupContext,
            category,
            name,
            color
          );

          const result = await createBasicNodeSync(group, ['color'] as const);
          res.status(201).json(result);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to create user group in the specified category and context',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while creating the user group in the specified category and context'
          );
      }
    }
  );
};
