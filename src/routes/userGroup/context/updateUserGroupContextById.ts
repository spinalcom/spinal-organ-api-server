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
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { Express } from 'express';
import validate from 'express-zod-safe';
import { getSpinalUserGroupContext } from 'spinal-model-user-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { createBasicNodeSync } from '../../../utilities/createBasicNode';
import { atLeastOne } from '../../../utilities/zodAtLeastOne';
import { safeSetAttr } from '../../../utilities/safeSetAttr';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user-group/context/{contextId}:
   *   patch:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Update a user group context by its ID
   *     description: Update a user group context by its ID
   *     tags:
   *       - User Group
   *     parameters:
   *       - in: path
   *         name: contextId
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *         description: The ID of the user group context to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 maxLength: 200
   *                 minLength: 1
   *                 description: new name of the user group context
   *               color:
   *                 type: string
   *                 pattern: '^#([A-Fa-f0-9]{6})$'
   *                 description: new color of the user group context in hexadecimal format (e.g., #RRGGBB or #RGB)
   *     responses:
   *       200:
   *         description: Successfully updated the user group context
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/BasicNodeWithColor'
   *       401:
   *         description: no graph found for the user
   */
  app.patch(
    '/api/v1/user-group/context/:contextId',
    validate({
      params: z.object({ contextId: z.coerce.number().positive() }),
      body: atLeastOne(
        z.strictObject({
          name: z.string().max(200).min(1).optional(),
          color: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6})$/)
            .optional(),
        })
      ),
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
          const { name, color } = req.body;
          safeSetAttr(userGroupContext.info, 'name', name);
          safeSetAttr(userGroupContext.info, 'color', color);

          const result = await createBasicNodeSync(userGroupContext, [
            'color',
          ] as const);
          res.status(200).json(result);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to update user group context',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while updating the user group context'
          );
      }
    }
  );
};
