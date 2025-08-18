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
import { SpinalNode } from 'spinal-model-graph';
import * as express from 'express';
import {
  createStepToProcess,
  getStepNodesFromProcess,
} from 'spinal-service-ticket';
import { getProfileId } from '../../../utilities/requestUtilities';
import { getWorkflowContextNode } from '../../../utilities/workflow/getWorkflowContextNode';
import { awaitSync } from '../../../utilities/awaitSync';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/workflow/{id}/create_step:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: add a Step
   *     summary: add a Step
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
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - processDynamicId
   *               - name
   *               - color
   *               - order
   *             properties:
   *               processDynamicId:
   *                 type: number
   *               name:
   *                 type: string
   *               color:
   *                 type: string
   *               order:
   *                 type: number
   *     responses:
   *       200:
   *         description: Added Successfully
   *       400:
   *         description: Add not Successfully
   */

  app.post('/api/v1/workflow/:id/create_step', async (req, res) => {
    try {
      // check params
      if (!req.body.processDynamicId || isNaN(+req.body.processDynamicId))
        return res
          .status(400)
          .send('Invalid processDynamicId attribute in the body');
      if (!req.body.name || typeof req.body.name !== 'string')
        return res.status(400).send('Invalid name attribute in the body');
      if (!req.body.color || typeof req.body.color !== 'string')
        return res.status(400).send('Invalid color attribute in the body');

      await spinalAPIMiddleware.getGraph();
      const profileId = getProfileId(req);
      // check workflowContextNode
      const workflowContextNode = await getWorkflowContextNode(
        spinalAPIMiddleware,
        profileId,
        req.params.id
      );

      // check processNode
      const processNode = await spinalAPIMiddleware.load<SpinalNode>(
        parseInt(req.body.processDynamicId, 10),
        profileId
      );
      if (!(processNode instanceof SpinalNode))
        return res.status(400).send('Invalid processDynamicId');

      // check stepsNodes duplication
      const stepsNodes = await getStepNodesFromProcess(
        processNode,
        workflowContextNode
      );
      if (
        stepsNodes.some(
          (stepNode) => stepNode.info.name.get() === req.body.name
        )
      ) {
        return res.status(400).send('The name of step already exists');
      }

      // create stepNode
      const stepNode = await createStepToProcess(
        processNode,
        workflowContextNode,
        req.body.name,
        req.body.color,
        req.body.order
      );
      // the creation was local so we need to sync it
      await awaitSync(stepNode);

      return res.status(200).json({
        dynamicId: stepNode._server_id,
        staticId: stepNode.info.id?.get() || undefined,
        name: stepNode.info.name?.get() || undefined,
        type: stepNode.info.type?.get() || undefined,
        color: stepNode.info.color?.get() || undefined,
        order: stepNode.info.order?.get() || undefined,
      });
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error.message);
    }
  });
};
