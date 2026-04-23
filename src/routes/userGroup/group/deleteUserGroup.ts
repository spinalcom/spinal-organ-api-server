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
import { SpinalNode } from 'spinal-model-graph';
import { getProfileId } from '../../../utilities/requestUtilities';
import {
  deleteSpinalUserGroup,
  SPINAL_USER_GROUP_TYPE,
} from 'spinal-model-user-service';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user-group/group/{groupId}:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Delete a user group by its ID
   *     description: Delete the user group with the given ID. Will also remove the users and control points linked to the group
   *     tags:
   *       - User Group
   *     parameters:
   *       - in: path
   *         name: groupId
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *         description: The ID of the user group to delete
   *     responses:
   *       204:
   *         description: Successfully deleted the user group
   *       401:
   *         description: no graph found for the user
   */
  app.delete(
    '/api/v1/user-group/group/:groupId',
    validate({
      params: z.object({
        groupId: z.coerce.number().positive(),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };

        try {
          const { groupId } = req.params;
          const group = await spinalAPIMiddleware.load<SpinalNode>(
            groupId,
            profileId
          );
          const parseResult = z
            .instanceof(SpinalNode)
            .refine((node) => node.info.type.get() === SPINAL_USER_GROUP_TYPE)
            .safeParse(group);
          if (!parseResult.success) {
            throw { code: 400, message: 'Invalid group data' };
          }

          await deleteSpinalUserGroup(group);

          res.status(204).send();
        } catch (error) {
          throw {
            code: 400,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to retrieve user group with the specified ID',
          };
        }
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while retrieving the user group with the specified ID'
          );
      }
    }
  );
};
