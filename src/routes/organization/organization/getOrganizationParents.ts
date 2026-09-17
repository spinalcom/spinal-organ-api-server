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
import {
  SPINAL_ORGANIZATION_TYPE,
  getParentOrganizationFromOrganization,
} from 'spinal-model-user-service';
import { createBasicNodeSync } from '../../../utilities/createBasicNode';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/organization/{organizationId}/parents:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Get the direct parents organization of an Organization
   *     description: Retrieve the parent organization of a specific Organization by its ID
   *     tags:
   *       - Organization
   *     parameters:
   *       - in: path
   *         name: organizationId
   *         required: true
   *         schema:
   *           type: number
   *           format: int64
   *           minimum: 1
   *           description: ID of the organization to retrieve the parent organization from
   *     responses:
   *       200:
   *         description: Parents organization retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/BasicNodeWithColor'
   *       400:
   *         description: Bad request - Invalid input or parameters
   *       404:
   *         description: Organization not found
   *       401:
   *         description: Unauthorized - No graph found for the user
   */
  app.get(
    '/api/v1/organization/:organizationId/parents',
    validate({
      params: z.strictObject({
        organizationId: z.coerce.number().positive(),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };
        const { organizationId } = req.params;

        try {
          const organization = await loadAndValidateNode(
            spinalAPIMiddleware,
            organizationId,
            profileId,
            SPINAL_ORGANIZATION_TYPE
          );
          const parentOrganizations =
            await getParentOrganizationFromOrganization(organization);

          const result = await Promise.all(
            parentOrganizations.map(async (parentOrganization) => {
              return createBasicNodeSync(parentOrganization, [
                'color',
              ] as const);
            })
          );
          res.status(200).json(result);
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to retrieve organization',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while retrieving the organization context'
          );
      }
    }
  );
};
