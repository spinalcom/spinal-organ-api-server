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
import { createOrganizationContext } from 'spinal-model-user-service';
import { createBasicNodeSync } from '../../../utilities/createBasicNode';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/organization/context:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create a new Organization Context
   *     description: Create a new Organization Context with a unique name and an optional color
   *     tags:
   *       - Organization
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
   *                 description: name of the organization context to create
   *               color:
   *                 type: string
   *                 pattern: '^#([A-Fa-f0-9]{6})$'
   *                 description: Hexadecimal color code for the organization context (e.g., #RRGGBB)
   *     responses:
   *       201:
   *         description: Organization Context created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/BasicNodeWithColor'
   *       400:
   *         description: failed to create organization context
   *       401:
   *         description: no graph found for the user
   */
  app.post(
    '/api/v1/organization/context',
    validate({
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
        const { name, color } = req.body;
        try {
          const organizationContext = await createOrganizationContext(
            userGraph,
            name,
            color
          );
          const result = await createBasicNodeSync(organizationContext, [
            'color',
          ] as const);
          res.status(201).json(result);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to create organization context',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while creating the organization context'
          );
      }
    }
  );
};
