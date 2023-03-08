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

import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { WorkflowTree } from '../interfacesWorkflowAndTickets'
import { recTree } from '../../../utilities/recTree'
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
  * @swagger
  * /api/v1/workflow/{id}/tree:
  *   get:
  *     security:
  *       - OauthSecurity:
  *         - readOnly
  *     description: Return tree of workflow
  *     summary: Get a tree workflow by ID
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
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *                $ref: '#/components/schemas/ContextTree'
  *       400:
  *         description: Bad request id
  *       500:
  *         description: internal server error
  */

  app.get("/api/v1/workflow/:id/tree", async (req, res, next) => {

    try {
      const workflowModel = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      if (workflowModel instanceof SpinalContext) {
        const workflows = {
          dynamicId: workflowModel._server_id,
          staticId: workflowModel.getId()?.get(),
          name: workflowModel.getName()?.get(),
          type: workflowModel.getType()?.get(),
          children: await recTree(workflowModel, workflowModel)
        };
        return res.json(workflows);
      }
      return res.status(400).send("ko");
    } catch (error) {
      console.error(error);
      return res.status(500).send("ko");
    }
  });

}
