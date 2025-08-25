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
import { createTicketContext, type ITicketStep } from 'spinal-service-ticket';
import { getProfileId } from '../../../utilities/requestUtilities';
import { awaitSync } from '../../../utilities/awaitSync';
import * as express from 'express';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/workflow/create:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: create a workflow
   *     summary: create a workflow
   *     tags:
   *       - Workflow & ticket
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nameWorkflow
   *             properties:
   *               nameWorkflow:
   *                 type: string
   *                 description: name of the workflow
   *               steps:
   *                 type: array
   *                 description: optionnal default steps that will be created in the workflow process
   *                 items:
   *                   type: object
   *                   required:
   *                     - name
   *                     - order
   *                   properties:
   *                     name:
   *                       type: string
   *                       description: name of the step
   *                     color:
   *                       type: string
   *                       description: color of the step
   *                     order:
   *                       type: integer
   *                       description: order of the step
   *     responses:
   *       200:
   *         description: Create Successfully
   *       400:
   *         description: create not Successfully
   */
  app.post('/api/v1/workflow/create', async (req, res) => {
    try {
      if (typeof req.body.nameWorkflow !== 'string') {
        return res.status(400).send('string nameWorkflow is invalide name');
      }
      const profileId = getProfileId(req);
      const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
      const graph = await spinalAPIMiddleware.getGraph();

      // search if the context name already exists
      const contextNodes = await graph.getChildren('hasContext');
      if (
        contextNodes.some(
          (child) => child.info.name?.get() === req.body.nameWorkflow
        )
      )
        return res.status(400).send('the name context already exists');

      const steps: ITicketStep[] = [];
      if (req.body.steps && Array.isArray(req.body.steps)) {
        for (const step of req.body.steps) {
          if (step.name && step.order) {
            steps.push({
              name: step.name,
              color: step.color || undefined,
              order: step.order,
            });
          }
        }
        steps.sort((a, b) => a.order - b.order);
      }
      const contextTicketNode = await createTicketContext(
        req.body.nameWorkflow,
        steps
      );
      await userGraph.addContext(contextTicketNode);
      await awaitSync(contextTicketNode);

      return res.status(200).json({
        dynamicId: contextTicketNode._server_id,
        name: contextTicketNode.info.name.get() || undefined,
        type: contextTicketNode.info.type.get() || undefined,
        staticId: contextTicketNode.info.id.get() || undefined,
      });
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};
