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
import getTicketDetails from '../../../utilities/workflow/getTicketDetails';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/user/{userId}/tickets:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Retrieve tickets for a SpinalUser by ID
   *     description: Retrieve tickets for a SpinalUser by their unique ID. Limit of 100 tickets per request with pagination using the offset query parameter.
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
   *       - in: query
   *         name: offset
   *         required: false
   *         schema:
   *           type: integer
   *           description: offset for pagination
   *           default: 0
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
  app.get(
    '/api/v1/user/:userId/tickets',
    validate({
      params: z.strictObject({
        userId: z.coerce.number().positive(),
      }),
      query: z.strictObject({
        offset: z.coerce.number().min(0).default(0),
        startDate: z.coerce.number().optional(),
        endDate: z.coerce.number().optional(),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
        if (!userGraph)
          throw { code: 401, message: `No graph found for ${profileId}` };
        const { userId } = req.params;
        const { offset } = req.query;
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

          const ticketNodes = await userNode.getChildren('UserHasTicket');
          // Sort tickets by creation date (newest first)
          const reversedTickets = ticketNodes.reverse();
          const resData: Record<string, any>[] = [];
          let i = offset;

          for (; i < reversedTickets.length && resData.length < 100; i++) {
            const ticket = reversedTickets[i];
            resData.push(
              getTicketDetails(
                spinalAPIMiddleware,
                profileId,
                ticket._server_id!,
                true
              )
            );
          }
          const result = await Promise.allSettled(resData);
          const fulfilledResults = result
            .filter((r) => r.status === 'fulfilled')
            .map((r: any) => r.value);
          if (fulfilledResults.length < 100 && i < reversedTickets.length) {
            while (
              i < reversedTickets.length &&
              fulfilledResults.length < 100
            ) {
              const ticket = reversedTickets[i];
              try {
                const ticketDetails = await getTicketDetails(
                  spinalAPIMiddleware,
                  profileId,
                  ticket._server_id!,
                  true
                );
                fulfilledResults.push(ticketDetails);
              } catch (error) {
                logger.error(
                  `Failed to retrieve details for ticket ${ticket._server_id}: ${error}`
                );
              }
              i++;
            }
          }
          res.status(200).json(fulfilledResults);
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
