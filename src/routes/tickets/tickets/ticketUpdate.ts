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
   *         - read
   *     description: update name and/or description of Ticket
   *     summary: update name and/or description of Ticket
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *       - in: path
   *         name: ticketId
   *         description: use the dynamic ID
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               priority:
   *                 type: number
   *     responses:
   *       200:
   *         description: updated Successfully
   *       400:
   *         description: update not Successfully
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
