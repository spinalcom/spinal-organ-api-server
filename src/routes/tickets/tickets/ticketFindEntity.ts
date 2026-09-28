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

import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { getTicketEntityInfo } from '../../../utilities/workflow/getTicketEntityInfo';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/ticket/{ticketId}/find_entity:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Get the element a ticket was declared on
   *     description: >-
   *       Returns the node the ticket concerns - the room, equipment or other element it was attached
   *       to at creation - in its short form (`dynamicId`, `staticId`, `name`, `type`).
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
   *     responses:
   *       200:
   *         description: The element the ticket concerns.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/BasicNode'
   *       401:
   *         description: The profile is not allowed to read this ticket.
   *       404:
   *         description: The ticket is not attached to any element ("Entity not found").
   *       500:
   *         description: The ticket could not be loaded, or it is not a ticket node.
   */
  app.get('/api/v1/ticket/:ticketId/find_entity', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const info = await getTicketEntityInfo(
        spinalAPIMiddleware,
        profileId,
        parseInt(req.params.ticketId, 10)
      );
      if (!info) return res.status(404).send('Entity not found');
      return res.status(200).json(info);
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};
