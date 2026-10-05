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

import { SpinalContext } from 'spinal-model-graph';
import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import {
  getAllTicketProcess,
  getStepNodesFromProcess,
  getTicketsFromStep,
  TICKET_CONTEXT_TYPE,
} from 'spinal-service-ticket';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/workflow/{id}/delete:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Delete a workflow
   *     description: >-
   *       Removes a workflow context, with its processes and steps.
   *
   *
   *       By default the tickets it holds are left in the graph, detached from the workflow. Pass
   *       `shouldDeleteTickets=true` to delete them along with it - that is not reversible.
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the workflow context.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: query
   *        name: shouldDeleteTickets
   *        description: Set to `true` to also delete every ticket of the workflow.
   *        required: false
   *        schema:
   *          type: boolean
   *          default: false
   *     responses:
   *       200:
   *         description: The workflow was deleted ("Delete Successfully").
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *       401:
   *         description: The profile is not allowed to delete this workflow.
   *       500:
   *         description: The workflow could not be loaded, is not a workflow context, or could not be removed.
   */

  app.delete('/api/v1/workflow/:id/delete', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const shouldDeleteTickets = req.query.shouldDeleteTickets === 'true';
      const workflowNode: SpinalContext = await loadAndValidateNode(
        spinalAPIMiddleware,
        parseInt(req.params.id, 10),
        profileId,
        TICKET_CONTEXT_TYPE
      );
      const proms: Promise<void>[] = [];
      const processNodes = await getAllTicketProcess(workflowNode);
      for (const processNode of processNodes) {
        const stepNodes = await getStepNodesFromProcess(
          processNode,
          workflowNode
        );

        for (const stepNode of stepNodes) {
          const tickets = await getTicketsFromStep(stepNode);
          if (shouldDeleteTickets) {
            for (const ticket of tickets) {
              proms.push(ticket.removeFromGraph());
            }
          }
          proms.push(stepNode.removeFromGraph());
        }
        proms.push(processNode.removeFromGraph());
      }
      proms.push(workflowNode.removeFromGraph());
      await Promise.all(proms);
      return res.status(200).send('Delete Successfully');
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};
