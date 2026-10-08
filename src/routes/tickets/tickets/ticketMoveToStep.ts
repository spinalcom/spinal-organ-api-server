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
  getProcessFromStep,
  getStepFromTicket,
  getStepNodesFromProcess,
  getTicketInfo,
  moveTicketToStep,
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
   * /api/v1/ticket/{ticketId}/move_to_step:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Move a ticket to a chosen step
   *     description: >-
   *       Moves a ticket straight to a given step of its process, in either direction - unlike
   *       `next_step` / `previous_step`, which advance one step at a time.
   *
   *
   *       The target step is named either by its order number (`toStepOrder`) or by its name
   *       (`toStepName`); at least one of the two is required. Note that the process is not passed
   *       here : the step is looked up in the process the ticket currently belongs to.
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
   *             properties:
   *               workflowDynamicId:
   *                 type: number
   *                 description: Dynamic ID of the workflow context the ticket lives in.
   *               toStepOrder:
   *                 type: number
   *                 description: Order number of the target step. Required when `toStepName` is not given.
   *               toStepName:
   *                 type: string
   *                 description: Name of the target step. Required when `toStepOrder` is not given.
   *     responses:
   *       200:
   *         description: The ticket with the step it now sits in.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 dynamicId:
   *                   type: integer
   *                   format: int64
   *                 staticId:
   *                   type: string
   *                 name:
   *                   type: string
   *                 type:
   *                   type: string
   *                 actuelStep:
   *                   type: string
   *                   description: Name of the step the ticket is in after the move.
   *       400:
   *         description: >-
   *           Neither `toStepOrder` nor `toStepName` was given ("Either toStepOrder or toStepName must
   *           be provided."), no step matches ("Target step not found."), or the ticket does not belong
   *           to the workflow.
   *       401:
   *         description: The profile is not allowed to write on the ticket.
   *       500:
   *         description: The workflow or the ticket could not be loaded, or is not of the expected type.
   */
  app.post('/api/v1/ticket/:ticketId/move_to_step', async (req, res) => {
    try {
      const { toStepOrder, toStepName } = req.body;
      if (toStepOrder == null && toStepName == null) {
        return res
          .status(400)
          .send('Either toStepOrder or toStepName must be provided.');
      }
      const profileId = getProfileId(req);
      const [workflowContextNode, ticketNode] = await Promise.all([
        loadAndValidateNode(
          spinalAPIMiddleware,
          parseInt(req.body.workflowDynamicId, 10),
          profileId,
          TICKET_CONTEXT_TYPE
        ),
        loadAndValidateNode(
          spinalAPIMiddleware,
          parseInt(req.params.ticketId, 10),
          profileId,
          SPINAL_TICKET_SERVICE_TICKET_TYPE
        ),
      ]);
      if (!ticketNode.belongsToContext(workflowContextNode)) {
        return res
          .status(400)
          .send('Ticket does not belong to the workflow context.');
      }

      const fromStepNode = await getStepFromTicket(ticketNode);
      const processNode = await getProcessFromStep(fromStepNode);

      const steps = await getStepNodesFromProcess(
        processNode,
        workflowContextNode
      );
      const toStepNode = steps.find(
        (step) =>
          step.info.name.get() === toStepName ||
          step.info.order.get() === toStepOrder
      );
      if (!toStepNode) {
        return res.status(400).send('Target step not found.');
      }

      if (toStepNode._server_id === fromStepNode._server_id) {
        return res
          .status(400)
          .send('The ticket is already in the target step.');
      }

      await moveTicketToStep(
        ticketNode,
        fromStepNode,
        toStepNode,
        workflowContextNode
      );

      const { description } = await getTicketInfo(ticketNode, [
        'description',
      ] as const);

      const info = {
        name: ticketNode.info.name.get(),
        id: ticketNode.info.id.get(),
        description,
        stepId: toStepNode.info.id.get(),
      };
      return res.json(info);
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};
