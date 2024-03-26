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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service';
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Workflow } from '../interfacesWorkflowAndTickets'
import { serviceTicketPersonalized } from 'spinal-service-ticket'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/workflow/{id}/create_process:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: create a Process
   *     summary: create a Process
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *      - in: path
   *        name: id
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nameProcess
   *             properties:
   *               nameProcess:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: create not Successfully
   */

  app.post('/api/v1/workflow/:id/create_process', async (req, res, next) => {
    try {
      await spinalAPIMiddleware.getGraph();

      const profileId = getProfileId(req);
      const workflow: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
      // @ts-ignore
      SpinalGraphService._addNode(workflow)

      const allProcess = await serviceTicketPersonalized.getAllProcess(workflow.getId().get());
      for (let index = 0; index < allProcess.length; index++) {
        const realNode = SpinalGraphService.getRealNode(allProcess[index].id.get())
        if (realNode.getName().get() === req.body.nameProcess) {
          return res.status(400).send("the name process already exists")
        }
      }
      if (req.body.nameProcess !== "string") {
        await serviceTicketPersonalized.createProcess({ name: req.body.nameProcess }, workflow.getId().get())
      } else {
        return res.status(400).send("invalid name string")
      }
    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      return res.status(500).send(error.message);
    }
    res.json();
  })
}
