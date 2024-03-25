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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Step } from '../interfacesWorkflowAndTickets'
import { serviceTicketPersonalized } from 'spinal-service-ticket'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/workflow/{workflowId}/process/{processId}/stepList:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns list of steps
   *     summary: Get list of steps
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *      - in: path
   *        name: workflowId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: processId
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
   *                $ref: '#/components/schemas/Step'
   *       400:
   *         description: Bad request
   */

  app.get(
    '/api/v1/workflow/:workflowId/process/:processId/stepList',
    async (req, res, next) => {
      const nodes = [];
      try {
        const profileId = getProfileId(req);

        const workflow = await spinalAPIMiddleware.load(parseInt(req.params.workflowId, 10), profileId);
        const process: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.processId, 10), profileId);
        // @ts-ignore
        SpinalGraphService._addNode(workflow);

        // @ts-ignore
        SpinalGraphService._addNode(process);


        if (workflow instanceof SpinalContext && process.belongsToContext(workflow)) {
          if (workflow.getType().get() === "SpinalSystemServiceTicket") {
            const allSteps = await SpinalGraphService.getChildren(process.getId().get(), ["SpinalSystemServiceTicketHasStep"])

            for (let index = 0; index < allSteps.length; index++) {
              const realNode = SpinalGraphService.getRealNode(allSteps[index].id.get())
              const info: Step = {
                dynamicId: realNode._server_id,
                staticId: realNode.getId().get(),
                name: realNode.getName().get(),
                type: realNode.getType().get(),
                color: realNode.info.color.get(),
                order: realNode.info.order.get(),
                processId: realNode.info.processId.get()
              }
              nodes.push(info);
            }
          }
          else {
            return res.status(400).send("this context is not a SpinalSystemServiceTicket");
          }
        } else {
          res.status(400).send("node not found in context");
        }
      } catch (error) {

        if (error.code && error.message) return res.status(error.code).send(error.message);
        return res.status(500).send(error.message);
      }
      res.json(nodes);
    })
}
