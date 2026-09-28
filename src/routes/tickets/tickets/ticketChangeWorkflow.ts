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

import type { ISpinalAPIMiddleware } from '../../../interfaces/ISpinalAPIMiddleware';
import * as express from 'express';
import {
  changeTicketProcess,
  PROCESS_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
  TICKET_CONTEXT_TYPE,
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
   * /api/v1/ticket/{ticketId}/change_workflow:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Move a ticket to another workflow
   *     description: >-
   *       Moves a ticket into a process of a different workflow, and places it in that process's first
   *       step. Both the target workflow and the target process must be given, and the process must
   *       belong to that workflow.
   *
   *
   *       A successful call answers **200 with an empty body**.
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
   *             required:
   *               - workflowDynamicId
   *               - processDynamicId
   *             properties:
   *               workflowDynamicId:
   *                 type: number
   *                 description: Dynamic ID of the target workflow context.
   *               processDynamicId:
   *                 type: number
   *                 description: Dynamic ID of the target process, inside that workflow.
   *     responses:
   *       200:
   *         description: The ticket was moved. The body is empty.
   *       401:
   *         description: The profile is not allowed to write on the ticket, the workflow or the process.
   *       500:
   *         description: One of the nodes could not be loaded, or is not of the expected type.
   */
  app.put('/api/v1/ticket/:ticketId/change_workflow', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const [newContextTicketNode, newProcessNode, ticketNode] =
        await Promise.all([
          loadAndValidateNode(
            spinalAPIMiddleware,
            parseInt(req.body.workflowDynamicId, 10),
            profileId,
            TICKET_CONTEXT_TYPE
          ),
          loadAndValidateNode(
            spinalAPIMiddleware,
            parseInt(req.body.processDynamicId, 10),
            profileId,
            PROCESS_TYPE
          ),
          loadAndValidateNode(
            spinalAPIMiddleware,
            parseInt(req.params.ticketId, 10),
            profileId,
            SPINAL_TICKET_SERVICE_TICKET_TYPE
          ),
        ]);
      await changeTicketProcess(
        ticketNode,
        newProcessNode,
        newContextTicketNode
      );
      return res.json();
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};
