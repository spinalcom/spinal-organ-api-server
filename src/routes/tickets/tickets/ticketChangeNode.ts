/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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

import { ISpinalAPIMiddleware } from '../../../interfaces/ISpinalAPIMiddleware';
import * as express from 'express';
import {
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
  changeTicketNodeTarget,
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
   * /api/v1/ticket/{ticketId}/change_node:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: change a node of Ticket, usualy a room or equipment
   *     summary: change a node of Ticket
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
   *             required:
   *               - nodeDynamicId
   *             properties:
   *               nodeDynamicId:
   *                 type: number
   *     responses:
   *       200:
   *         description: change node Successfully
   *       400:
   *         description: change node not Successfully
   */
  app.put('/api/v1/ticket/:ticketId/change_node', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const [targetNode, ticketNode] = await Promise.all([
        loadAndValidateNode(
          spinalAPIMiddleware,
          parseInt(req.body.nodeDynamicId, 10),
          profileId
        ),
        loadAndValidateNode(
          spinalAPIMiddleware,
          parseInt(req.params.ticketId, 10),
          profileId,
          SPINAL_TICKET_SERVICE_TICKET_TYPE
        ),
      ]);
      await changeTicketNodeTarget(ticketNode, targetNode);
      return res.json({ success: true });
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};
