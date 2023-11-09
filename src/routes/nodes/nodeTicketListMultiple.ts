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

import { ISpinalAPIMiddleware } from '../../interfaces';
import * as express from 'express';
import { getProfileId } from '../../utilities/requestUtilities';
import { getTicketListInfo } from '../../utilities/getTicketListInfo';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/ticket_list_multiple:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns a list of ticket objects for multiple nodes, including error details where applicable.
   *     summary: Get list of ticket objects for multiple nodes
   *     tags:
   *       - Nodes
   *     requestBody:
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
   *         description: Success - All ticket lists fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   dynamicId:
   *                     type: integer
   *                   tickets:
   *                     type: array
   *                     items:
   *                       $ref: '#/components/schemas/Ticket'
   *       206:
   *         description: Partial Content - Some tickets could not be fetched
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - type: object
   *                     properties:
   *                       dynamicId:
   *                         type: integer
   *                       tickets:
   *                         type: array
   *                         items:
   *                           $ref: '#/components/schemas/Ticket'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request
   */
  app.post('/api/v1/node/ticket_list_multiple', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const ids: number[] = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).send('Expected an array of IDs.');
      }

      const promises = ids.map((id) =>
        getTicketListInfo(spinalAPIMiddleware,profileId, id).then((tickets) => ({
          dynamicId: id,
          tickets,
        }))
      );
      const settledResults = await Promise.allSettled(promises);

      const finalResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Error with id ${ids[index]}: ${result.reason}`);
          return {
            dynamicId: ids[index],
            error:
              result.reason?.message ||
              result.reason ||
              'Failed to get Tickets',
          };
        }
      });

      const isGotError = settledResults.some(
        (result) => result.status === 'rejected'
      );
      if (isGotError) {
        return res.status(206).json(finalResults);
      }
      return res.status(200).json(finalResults);
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      return res
        .status(400)
        .send('An error occurred while fetching ticket list.');
    }
  });
};
