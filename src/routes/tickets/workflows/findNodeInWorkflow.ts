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

import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { Workflow } from '../interfacesWorkflowAndTickets';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-model-graph';
import { findOneInContext } from '../../../utilities/findOneInContext';
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
   * /api/v1/workflow/{workflowId}/node/{nodeId}/find:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: Find a node inside a workflow by its static ID
   *     description: >-
   *       Browses a workflow context looking for a node with the given **static ID** and returns its
   *       summary, including the `dynamicId` the other routes need. This is how a persistent ID is
   *       turned back into a usable dynamic ID after a hub restart.
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *       - in: path
   *         name: workflowId
   *         description: Dynamic ID of the workflow context to search in.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: nodeId
   *         description: Static ID of the node to find.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: The node summary.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Workflow'
   *       401:
   *         description: The profile is not allowed to read this workflow.
   *       404:
   *         description: No node with this static ID exists in the workflow ("node not found").
   *       500:
   *         description: The workflow could not be loaded, or it is not a workflow context.
   */

  app.get(
    '/api/v1/workflow/:workflowId/node/:nodeId/find',
    async (req, res) => {
      try {
        await spinalAPIMiddleware.getGraph();
        const profileId = getProfileId(req);

        //  check workflow
        const workflow = await loadAndValidateNode(
          spinalAPIMiddleware,
          parseInt(req.params.workflowId, 10),
          profileId,
          TICKET_CONTEXT_TYPE
        );

        let node = SpinalGraphService.getRealNode(req.params.nodeId);
        if (typeof node === 'undefined') {
          node = await findOneInContext(
            workflow,
            workflow,
            (n) => n.info.id.get() === req.params.nodeId
          );
        }
        if (node instanceof SpinalNode && node.belongsToContext(workflow)) {
          const info: Workflow = {
            dynamicId: node._server_id,
            staticId: node.info.id.get() || undefined,
            name: node.info.name.get() || undefined,
            type: node.info.type.get() || undefined,
          };
          return res.json(info);
        }
        return res.status(404).send('node not found');
      } catch (error) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res.status(500).send(error?.message);
      }
    }
  );
};
