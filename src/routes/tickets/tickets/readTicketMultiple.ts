/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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

import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { getTicketDetails } from '../../../utilities/getTicketDetails';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/ticket/read_details_multiple:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Returns details for multiple tickets
   *     summary: Get details of multiple tickets
   *     tags:
   *       - Workflow & ticket
   *     requestBody:
   *       description: An array of ticket IDs to fetch details for
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: integer
   *               format: int64
   *     responses:
   *       200:
   *         description: Success - All ticket details fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/TicketDetails'
   *       206:
   *         description: Partial Content - Some ticket details could not be fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/TicketDetails'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request
   */
  app.post('/api/v1/ticket/read_details_multiple', async (req, res, next) => {
    try {
      const ids: number[] = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).send('Expected an array of IDs.');
      }

      // Map each id to a promise
      const promises = ids.map((id) =>
        getTicketDetails(spinalAPIMiddleware, id)
      );

      const settledResults = await Promise.allSettled(promises);

      const finalResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Error with ticket id ${ids[index]}: ${result.reason}`);
          return {
            dynamicId: ids[index],
            error:
              result.reason?.message ||
              result.reason ||
              'Failed to get Ticket Details',
          };
        }
      });

      const isGotError = settledResults.some(
        (result) => result.status === 'rejected'
      );
      if (isGotError) return res.status(206).json(finalResults);
      return res.status(200).json(finalResults);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message || 'ko');
    }
  });
};
