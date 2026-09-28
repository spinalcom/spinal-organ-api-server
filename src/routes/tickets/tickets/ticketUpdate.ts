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

import type { ISpinalAPIMiddleware } from '../../../interfaces';
import * as express from 'express';
import {
  getTicketInfo,
  updateTicketAttributes,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
} from 'spinal-service-ticket';
import { getProfileId } from '../../../utilities/requestUtilities';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/ticket/{ticketId}/update:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Update the name, description or priority of a ticket
   *     description: >-
   *       Updates the fields present in the body and leaves the others untouched, so this is a partial
   *       update.
   *
   *
   *       Only truthy values are considered : sending `""`, `0` or `null` for a field leaves it
   *       unchanged rather than clearing it. `name` and `description` must be non-empty strings, and
   *       `priority` a number between 0 and 5 - anything else is rejected with 400. Note that the
   *       ticket creation route only documents priorities 0 to 2.
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *       - in: path
   *         name: ticketId
   *         description: Dynamic ID of the ticket.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Non-empty string.
   *               description:
   *                 type: string
   *                 description: Non-empty string.
   *               priority:
   *                 type: number
   *                 description: Number between 0 and 5.
   *     responses:
   *       200:
   *         description: The ticket was updated, as `{ success, ticketInfo }`.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 ticketInfo:
   *                   type: object
   *                   description: The ticket as it stands after the update.
   *       400:
   *         description: >-
   *           One of the fields is invalid ("Invalid name", "Invalid description", "Invalid
   *           priority").
   *       401:
   *         description: The profile is not allowed to write on this ticket.
   *       500:
   *         description: The ticket could not be loaded, or it is not a ticket node.
   */
  app.put('/api/v1/ticket/:ticketId/update', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const name = req.body.name;
      const description = req.body.description;
      const priority = req.body.priority;
      const ticketInfoToUpdate: Record<string, string> = {};
      if (name) {
        if (typeof name !== 'string' || name.trim() === '') {
          return res.status(400).send('Invalid name');
        }
        Object.assign(ticketInfoToUpdate, { name });
      }
      if (description) {
        if (typeof description !== 'string' || description.trim() === '') {
          return res.status(400).send('Invalid description');
        }
        Object.assign(ticketInfoToUpdate, { description });
      }
      if (priority) {
        if (typeof priority !== 'number' || priority < 0 || priority > 5) {
          return res.status(400).send('Invalid priority');
        }
        Object.assign(ticketInfoToUpdate, { priority });
      }
      const ticketNode = await loadAndValidateNode(
        spinalAPIMiddleware,
        parseInt(req.params.ticketId, 10),
        profileId,
        SPINAL_TICKET_SERVICE_TICKET_TYPE
      );

      await updateTicketAttributes(ticketNode, ticketInfoToUpdate);
      const ticketInfo = await getTicketInfo(ticketNode, [
        'description',
        'priority',
      ]);
      const updatedTicketInfo = {
        name: ticketNode.info.name.get(),
        description: ticketInfo.description,
        priority: ticketInfo.priority,
      };
      console.log('Ticket updated successfully:', updatedTicketInfo);

      return res.json({ success: true, ticketInfo: updatedTicketInfo });
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};
