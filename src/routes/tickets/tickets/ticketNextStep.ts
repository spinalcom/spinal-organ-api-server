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
  getStepFromTicket,
  moveTicketToNextStep,
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
   * /api/v1/ticket/{ticketId}/next_step:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: move a Ticket
   *     summary: move a Ticket
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
   *               - workflowDynamicId
   *               - processDynamicId
   *             properties:
   *               workflowDynamicId:
   *                 type: number
   *               processDynamicId:
   *                 type: number
   *     responses:
   *       200:
   *         description: move to next step Successfully
   *       400:
   *         description: move to next step not Successfully
   */
  app.post('/api/v1/ticket/:ticketId/next_step', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const [workflowContextNode, processNode, ticketNode] = await Promise.all([
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
      if (!processNode.belongsToContext(workflowContextNode))
        return res
          .status(400)
          .send('Process does not belong to workflow context.');
      if (!ticketNode.belongsToContext(workflowContextNode))
        return res
          .status(400)
          .send('Ticket does not belong to workflow context.');

      await moveTicketToNextStep(workflowContextNode, processNode, ticketNode);

      const stepNode = await getStepFromTicket(ticketNode, workflowContextNode);
      const info = {
        dynamicId: ticketNode._server_id,
        staticId: ticketNode.info.id.get(),
        name: ticketNode.info.name.get(),
        type: ticketNode.info.type.get(),
        actuelStep: stepNode?.info.name.get(),
      };
      return res.status(200).send(info);
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};
