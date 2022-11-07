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
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Workflow } from '../interfacesWorkflowAndTickets'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
  * @swagger
  * /api/v1/workflow/{id}/read:
  *   get:
  *     security:
  *       - OauthSecurity:
  *         - readOnly
  *     description: read a workflow
  *     summary: read a workflow
  *     tags:
  *       - Workflow & ticket
  *     parameters:
  *       - in: path
  *         name: id
  *         description: use the dynamic ID
  *         required: true
  *         schema:
  *           type: integer
  *           format: int64
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *                $ref: '#/components/schemas/Workflow'
  *       400:
  *         description: Bad request
  */

  app.get("/api/v1/workflow/:id/read", async (req, res, next) => {
    try {
      var workflow: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));

      if (workflow.getType().get() === "SpinalSystemServiceTicket") {
        var info: Workflow = {
          dynamicId: workflow._server_id,
          staticId: workflow.getId().get(),
          name: workflow.getName().get(),
          type: workflow.getType().get(),
        }
      }
      else {
        res.status(400).send("this context is not a SpinalSystemServiceTicket");
      }

    } catch (error) {
      console.log(error);
      res.status(400).send("ko");
    }
    res.json(info);
  })
}
