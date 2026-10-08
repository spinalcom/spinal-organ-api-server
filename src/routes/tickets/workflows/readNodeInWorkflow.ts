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

import type { Workflow } from '../interfacesWorkflowAndTickets';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { TICKET_CONTEXT_TYPE } from 'spinal-service-ticket';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/workflow/{workflowId}/node/{nodeId}/read:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Read a node of a workflow
   *     description: >-
   *       Returns the summary of a node of a workflow, looked up by its **static ID** in the graph
   *       service.
   *
   *
   *       Unlike `/api/v1/workflow/{workflowId}/node/{nodeId}/find`, it does not browse the workflow :
   *       a node that is not currently loaded yields a `null` body with a 200 status.
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *       - in: path
   *         name: workflowId
   *         description: Dynamic ID of the workflow context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: nodeId
   *         description: Static ID of the node to read.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: The node summary, or `null` when the node is not currently loaded.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Workflow'
   *       400:
   *         description: The node does not belong to this workflow ("this node is not valid in the workflow context").
   *       401:
   *         description: The profile is not allowed to read this workflow.
   *       500:
   *         description: The workflow could not be loaded, or it is not a workflow context.
   */

  app.get(
    '/api/v1/workflow/:workflowId/node/:nodeId/read',
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const workflow = await loadAndValidateNode(
          spinalAPIMiddleware,
          parseInt(req.params.workflowId, 10),
          profileId,
          TICKET_CONTEXT_TYPE
        );
        const node = await loadAndValidateNode(
          spinalAPIMiddleware,
          parseInt(req.params.nodeId, 10),
          profileId
        );

        if (!node.belongsToContext(workflow))
          return res
            .status(400)
            .send(`this node is not valid in the workflow context`);

        const info: Workflow = {
          dynamicId: node._server_id,
          staticId: node.info.id.get(),
          name: node.info.name.get(),
          type: node.info.type.get(),
        };
        return res.json(info);
      } catch (error) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res.status(500).send(error?.message);
      }
    }
  );
};
