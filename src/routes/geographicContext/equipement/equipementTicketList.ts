/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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

import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import * as express from 'express';
import { serviceTicketPersonalized } from 'spinal-service-ticket';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { getTicketDetails } from '../../../utilities/workflow/getTicketDetails';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/equipement/{id}/ticket_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns list of tickets of equipement
   *     summary: Get list of tickets of equipement
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Ticket'
   *       400:
   *         description: Bad request
   */
  app.get('/api/v1/equipement/:id/ticket_list', async (req, res, next) => {
    const nodes = [];
    try {
      await spinalAPIMiddleware.getGraph();
      const profileId = getProfileId(req);
      const equipement = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10),
        profileId
      );
      //@ts-ignore
      SpinalGraphService._addNode(equipement);

      if (equipement.getType().get() === 'BIMObject') {
        const ticketList = await serviceTicketPersonalized.getTicketsFromNode(
          equipement.getId().get()
        );
        const chunkSize = 50;
        for (let i = 0; i < ticketList.length; i += chunkSize) {
          const chunk = ticketList.slice(i, i + chunkSize);
          const promises = chunk.map((ticket) =>
            getTicketDetails(spinalAPIMiddleware, profileId, ticket.id)
          );
          const results = await Promise.all(promises);
          nodes.push(...results);
        }
      } else {
        res.status(400).send('node is not of type BIMObject');
      }
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(400).send('ko');
    }
    res.json(nodes);
  });
};
