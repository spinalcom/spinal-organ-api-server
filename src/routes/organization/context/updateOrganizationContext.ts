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
import { getOrganizationContext } from 'spinal-model-user-service';
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
   * /api/v1/organization/context/{contextId}:
   *   patch:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Update an Organization Context by ID
   *     description: Update a specific Organization Context by its ID
   *     tags:
   *       - Organization
   *     parameters:
   *       - in: path
   *         name: contextId
   *         required: true
   *         schema:
   *           type: number
   *           format: int64
   *           minimum: 1
   *           description: ID of the organization context to update
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
   *                 description: name of the organization context to update
   *               color:
   *                 type: string
   *                 pattern: '^#([A-Fa-f0-9]{6})$'
   *                 description: Hexadecimal color code for the organization context (e.g., #RRGGBB)
   *     responses:
   *       200:
   *         description: Update Successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BasicNodeWithColor'
   *       400:
   *         description: Bad request - Invalid input or parameters
   *       404:
   *         description: Organization context not found
   *       401:
   *         description: no graph found for the user
   */
  app.patch(
    '/api/v1/organization/context/:contextId',
    validate({
      params: z.strictObject({
        contextId: z.coerce.number().positive(),
      }),
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
        const { contextId } = req.params;

        try {
          const organizationContexts = await getOrganizationContext(userGraph);
          const organizationContext = organizationContexts.find(
            (context) => context._server_id === contextId
          );
          if (!organizationContext)
            throw {
              code: 404,
              message: `No organization context found with the ID ${contextId}`,
            };
          const { name, color } = req.body;
          safeSetAttr(organizationContext.info, 'name', name);
          safeSetAttr(organizationContext.info, 'color', color);
          const result = await createBasicNodeSync(organizationContext, [
            'color',
          ] as const);
          res.status(200).json(result);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to update organization context',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while updating the organization context'
          );
      }
    }
  );
};
