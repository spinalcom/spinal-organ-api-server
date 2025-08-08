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
import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { findOneInContext } from '../../../utilities/findOneInContext';
import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { TICKET_CONTEXT_TYPE } from 'spinal-service-ticket';

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
   *     description: find a node in workflow
   *     summary: find a node in workflow
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
   *         description: use the Static ID
   *         required: true
   *         schema:
   *           type: string
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

  app.get(
    '/api/v1/workflow/:workflowId/node/:nodeId/find',
    async (req, res) => {
      try {
        await spinalAPIMiddleware.getGraph();
        const profileId = getProfileId(req);

        //  check workflow
        const workflow: SpinalContext = await spinalAPIMiddleware.load(
          parseInt(req.params.workflowId, 10),
          profileId
        );
        if (
          !(workflow instanceof SpinalContext) ||
          workflow.getType().get() !== TICKET_CONTEXT_TYPE
        ) {
          return res
            .status(400)
            .send(`this context is not a '${TICKET_CONTEXT_TYPE}'`);
        }

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
        if (error.code && error.message)
          return res.status(error.code).send(error.message);
        return res.status(500).send(error.message);
      }
    }
  );
};
