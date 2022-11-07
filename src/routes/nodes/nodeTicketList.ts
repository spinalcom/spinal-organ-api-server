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
import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { serviceTicketPersonalized } from 'spinal-service-ticket';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{id}/ticket_list:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Returns list of tickets object
   *     summary: Get list of tickets object
   *     tags:
   *       - Nodes
   *     parameters:
   *      - in: path
   *        name: id
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
   *                $ref: '#/components/schemas/Ticket'
   *       400:
   *         description: Bad request
   */
  app.get('/api/v1/node/:id/ticket_list', async (req, res, next) => {
    let nodes = [];
    try {
      await spinalAPIMiddleware.getGraph();
      var node: SpinalNode<any> = await spinalAPIMiddleware.load(
        parseInt(req.params.id, 10)
      );
      //@ts-ignore
      SpinalGraphService._addNode(node);

      var ticketList = await node.getChildren(
        'SpinalSystemServiceTicketHasTicket'
      );
      for (const ticket of ticketList) {
        //context && workflow
        const workflow = SpinalGraphService.getRealNode(
          ticket.getContextIds()[0]
        );
        //Step
        let _step = await ticket
          .getParents('SpinalSystemServiceTicketHasTicket')
          .then((steps) => {
            for (const step of steps) {
              if (
                step.getType().get() === 'SpinalSystemServiceTicketTypeStep'
              ) {
                return step;
              }
            }
          });
        let _process = await _step
          .getParents('SpinalSystemServiceTicketHasStep')
          .then((processes) => {
            for (const process of processes) {
              if (process.getType().get() === 'SpinalServiceTicketProcess') {
                return process;
              }
            }
          });
        var info = {
          dynamicId: ticket._server_id,
          staticId: ticket.getId().get(),
          name: ticket.getName().get(),
          type: ticket.getType().get(),
          priority: ticket.info.priority.get(),
          creationDate: ticket.info.creationDate.get(),
          userName:
            ticket.info.user == undefined ? '' : ticket.info.user.name.get(),
          gmaoId:
            ticket.info.gmaoId == undefined ? '' : ticket.info.gmaoId.get(),
          gmaoDateCreation:
            ticket.info.gmaoDateCreation == undefined
              ? ''
              : ticket.info.gmaoDateCreation.get(),
          description:
            ticket.info.description == undefined
              ? ''
              : ticket.info.description.get(),
          declarer_id:
            ticket.info.declarer_id == undefined
              ? ''
              : ticket.info.declarer_id.get(),
          process:
            _process === undefined
              ? ''
              : {
                dynamicId: _process._server_id,
                staticId: _process.getId().get(),
                name: _process.getName().get(),
                type: _process.getType().get(),
              },
          step:
            _step === undefined
              ? ''
              : {
                dynamicId: _step._server_id,
                staticId: _step.getId().get(),
                name: _step.getName().get(),
                type: _step.getType().get(),
                color: _step.info.color.get(),
                order: _step.info.order.get(),
              },
          workflowId: workflow?._server_id,
          workflowName: workflow?.getName().get(),
        };
        nodes.push(info);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send('ko');
    }
    res.json(nodes);
  });
};
