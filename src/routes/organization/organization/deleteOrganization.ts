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
  removeOrganization,
  SPINAL_ORGANIZATION_CONTEXT_TYPE,
  SPINAL_ORGANIZATION_TYPE,
} from 'spinal-model-user-service';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/organization/{parentOrganizationId}/{organizationIdToBeRemoved}:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Delete an Organization
   *     description: Delete a specific Organization by its ID and its parent Organization (context) ID
   *     tags:
   *       - Organization
   *     parameters:
   *       - in: path
   *         name: parentOrganizationId
   *         required: true
   *         schema:
   *           type: number
   *           format: int64
   *           minimum: 1
   *           description: ID of the parent organization (context) of the organization to be removed
   *       - in: path
   *         name: organizationIdToBeRemoved
   *         required: true
   *         schema:
   *           type: number
   *           format: int64
   *           minimum: 1
   *           description: ID of the organization to be removed
   *     responses:
   *       204:
   *         description: Organization deleted successfully
   *       400:
   *         description: Bad request - Invalid input or parameters
   *       404:
   *         description: Organization context not found
   *       401:
   *         description: Unauthorized - No graph found for the user
   */
  app.delete(
    '/api/v1/organization/:parentOrganizationId/:organizationIdToBeRemoved',
    validate({
      params: z.strictObject({
        parentOrganizationId: z.coerce.number().positive(),
        organizationIdToBeRemoved: z.coerce.number().positive(),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };
        const { parentOrganizationId, organizationIdToBeRemoved } = req.params;

        try {
          const organizationParent = await loadAndValidateNode(
            spinalAPIMiddleware,
            parentOrganizationId,
            profileId
          );
          if (
            ![
              SPINAL_ORGANIZATION_CONTEXT_TYPE,
              SPINAL_ORGANIZATION_TYPE,
            ].includes(organizationParent.info.type?.get())
          ) {
            throw {
              code: 404,
              message: `No organization or organization context found with the ID ${parentOrganizationId}`,
            };
          }

          const organizationToBeRemoved = await loadAndValidateNode(
            spinalAPIMiddleware,
            organizationIdToBeRemoved,
            profileId,
            SPINAL_ORGANIZATION_TYPE
          );

          await removeOrganization(organizationToBeRemoved, organizationParent);
          res.status(204).send();
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to retrieve organization or organization context',
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
