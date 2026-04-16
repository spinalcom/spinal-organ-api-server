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
import { SpinalNode } from 'spinal-model-graph';
import { getProfileId } from '../../../utilities/requestUtilities';
import { getUserData } from '../../../utilities/getUserData';
import { updateSpinalUser } from 'spinal-model-user-service';
import { atLeastOne } from '../../../utilities/zodAtLeastOne';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user/{userId}:
   *   patch:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Update a SpinalUser by ID
   *     description: Update a SpinalUser by their unique ID.
   *     tags:
   *       - User
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *           description: dynamic ID of the user to retrieve
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 maxLength: 200
   *                 minLength: 1
   *               color:
   *                 type: string
   *                 pattern: '^#([A-Fa-f0-9]{6})$'
   *                 description: Hexadecimal color code for the user (e.g., #RRGGBB)
   *               attributes:
   *                 type: object
   *                 additionalProperties:
   *                   type: string
   *     responses:
   *       200:
   *         description: Retrieve Successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/IUser'
   *       400:
   *         description: Bad request - Invalid input or parameters
   *       404:
   *         description: User not found
   *       401:
   *         description: no graph found for the user
   */
  app.patch(
    '/api/v1/user/:userId',
    validate({
      params: z.strictObject({
        userId: z.coerce.number().positive(),
      }),
      body: atLeastOne(
        z.strictObject({
          email: z.string().max(200).min(1).optional(),
          color: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6})$/)
            .optional(),
          attributes: z.record(z.string(), z.string()).optional(),
        })
      ),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };
        const { userId } = req.params;
        const { email, color, attributes } = req.body;
        try {
          const userNode = await spinalAPIMiddleware.load<SpinalNode>(
            userId,
            profileId
          );
          if (
            !userNode ||
            !(userNode instanceof SpinalNode) ||
            userNode.info.type.get() !== 'SpinalUser'
          ) {
            throw { code: 404, message: `User not found` };
          }

          await updateSpinalUser(userNode, email, color, attributes || {});
          const result = await getUserData(userNode, true, false, false);
          res.status(200).json(result);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to retrieve user data',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send('An unexpected error occurred while retrieving the user data');
      }
    }
  );
};
