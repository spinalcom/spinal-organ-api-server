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
import { FileSystem } from 'spinal-core-connectorjs_type';
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Step } from '../interfacesWorkflowAndTickets'
import { serviceTicketPersonalized } from 'spinal-service-ticket'
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { ServiceUser } from "spinal-service-user";
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
  * @swagger
  * /api/v1/ticket/{ticketId}/archive:
  *   post:
  *     security:
  *       - bearerAuth:
  *         - read
  *     description: archive a Ticket
  *     summary: archive a Ticket
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
  *         description: Archive Successfully
  *       400:
  *         description: Archive not Successfully
  */
  app.post("/api/v1/ticket/:ticketId/archive", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const workflow = await spinalAPIMiddleware.load(parseInt(req.body.workflowDynamicId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(workflow)
      const process = await spinalAPIMiddleware.load(parseInt(req.body.processDynamicId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(process)
      const ticket = await spinalAPIMiddleware.load(parseInt(req.params.ticketId, 10), profileId);
      //@ts-ignore
      SpinalGraphService._addNode(ticket)

      await serviceTicketPersonalized.ArchiveTickets(workflow.getId().get(), process.getId().get(), ticket.getId().get())
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json();
  })

}
