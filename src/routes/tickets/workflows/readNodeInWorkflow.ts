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
import { findOneInContext } from '../../../utilities/findOneInContext';
import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { Workflow } from '../interfacesWorkflowAndTickets'

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
  * @swagger
  * /api/v1/workflow/{workflowId}/node/{nodeId}/read:
  *   get:
  *     security:
  *       - OauthSecurity:
  *         - readOnly
  *     description: read a node in workflow
  *     summary: read a node in workflow
  *     tags:
  *       - Workflow & ticket
  *     parameters:
  *       - in: path
  *         name: workflowId
  *         description: use the dynamic ID
  *         required: true
  *         schema:
  *           type: integer
  *           format: int64
  *       - in: path
  *         name: nodeId
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

  app.get("/api/v1/workflow/:workflowId/node/:nodeId/read", async (req, res, next) => {
    try {
      var workflow: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.workflowId, 10));
      var node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10));
      // @ts-ignore
      SpinalGraphService._addNode(node);

      if (workflow.getType().get() === "SpinalSystemServiceTicket" && typeof node !== "undefined") {
        var info: Workflow = {
          dynamicId: node._server_id,
          staticId: node.getId().get(),
          name: node.getName().get(),
          type: node.getType().get(),
        }
      }
      else if (workflow.getType().get() !== "SpinalSystemServiceTicket") {
        return res.status(400).send("this context is not a SpinalSystemServiceTicket");
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("ko");
    }
    res.json(info);
  })

}
