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
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { FileSystem } from 'spinal-core-connectorjs_type';
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Step } from '../interfacesWorkflowAndTickets';
import { serviceTicketPersonalized } from 'spinal-service-ticket';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { ServiceUser } from 'spinal-service-user';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

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
   *         - read
   *     description: move a Ticket to a specific step
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
   *             properties:
   *               workflowDynamicId:
   *                 type: number
   *               toStepOrder:
   *                 type: number
   *                 description: "Order number of the target step (optional, required if toStepName is not provided)"
   *               toStepName:
   *                 type: string
   *                 description: "Name of the target step (optional, required if toStepOrderId is not provided)"
   *     responses:
   *       200:
   *         description: move to next step Successfully
   *       400:
   *         description: move to next step not Successfully
   */
  app.post('/api/v1/ticket/:ticketId/move_to_step', async (req, res, next) => {
    try {
      const { toStepOrder, toStepName } = req.body;
      if (toStepOrder == null && toStepName == null) {
        return res.status(400).send('Either toStepOrder or toStepName must be provided.');
      }
      const profileId = getProfileId(req);
      const workflow: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(req.body.workflowDynamicId, 10),
        profileId
      );

      SpinalGraphService._addNode(workflow);
      
      const ticket: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(req.params.ticketId, 10),
        profileId
      );
      SpinalGraphService._addNode(ticket);
      
      const fromStepId = ticket.info.stepId.get();

      const processNode : SpinalNode<any> = await serviceTicketPersonalized.getTicketProcess(ticket.getId().get())
      SpinalGraphService._addNode(processNode);

      const steps = await serviceTicketPersonalized.getStepsFromProcess(processNode.getId().get(), workflow.getId().get());
      const toStep = steps.find(step => step.name.get() === toStepName || step.order.get() === toStepOrder);
      if (!toStep) {
        return res.status(400).send('Target step not found.');
      }

      if(toStep.id.get() === fromStepId) {
        return res.status(400).send('The ticket is already in the target step.');
      }

      const result = await serviceTicketPersonalized.moveTicketToStep(
        ticket.getId().get(),
        fromStepId,
        toStep.id.get(),
        workflow.getId().get()
      );

      const info = {
        name: ticket.getName().get(),
        id: ticket.getId().get(),
        description: ticket.info.description.get(),
        stepId: ticket.info.stepId.get(),
      };
      return res.json(info);
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  });
};
