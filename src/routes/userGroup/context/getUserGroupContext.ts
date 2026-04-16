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

import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { Express } from 'express';
import { getSpinalUserGroupContext } from 'spinal-model-user-service';
import { getProfileId } from '../../../utilities/requestUtilities';
import { createBasicNodeSync } from '../../../utilities/createBasicNode';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user-group/context:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Get all the user group contexts
   *     description: Get all the user group contexts
   *     tags:
   *       - User Group
   *     responses:
   *       200:
   *         description: Successfully retrieved the user group contexts
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 $ref: '#/components/schemas/BasicNodeWithColor'
   *       401:
   *         description: no graph found for the user
   */
  app.get('/api/v1/user-group/context', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
      if (!userGraph)
        throw { code: 401, message: `No graph found for ${profileId}` };

      try {
        const userGroupContexts = await getSpinalUserGroupContext(userGraph);

        const result = await Promise.all(
          userGroupContexts.map((context) =>
            createBasicNodeSync(context, ['color'] as const)
          )
        );
        res.status(200).json(result);
      } catch (error) {
        throw {
          code: 400,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to create user group context',
        };
      }
    } catch (error: any) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res
        .status(500)
        .send(
          'An unexpected error occurred while retrieving the user group contexts'
        );
    }
  });
};
