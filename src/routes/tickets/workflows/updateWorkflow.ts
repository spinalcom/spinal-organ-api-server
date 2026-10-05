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
   * /api/v1/workflow/{id}/update:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Rename a workflow
   *     description: >-
   *       Renames a workflow context. As at creation, the new name must not be used by any other
   *       context of the twin.
   *
   *
   *       Only the name changes; the processes, steps and tickets below are untouched.
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *       - in: path
   *         name: id
   *         description: Dynamic ID of the workflow context.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - newNameWorkflow
   *             properties:
   *               newNameWorkflow:
   *                 type: string
   *     responses:
   *       200:
   *         description: The workflow was renamed (body is `Success`).
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *       400:
   *         description: >-
   *           `newNameWorkflow` is not a string, the name is already taken ("the name context already
   *           exists"), or the workflow could not be loaded.
   *       401:
   *         description: The profile is not allowed to write on this workflow.
   */

  app.put('/api/v1/workflow/:id/update', async (req, res) => {
    try {
      if (typeof req.body.newNameWorkflow !== 'string') {
        return res.status(400).send(`the newNameWorkflow string is invalid`);
      }
      const profileId = getProfileId(req);
      const workflowNode = await loadAndValidateNode(
        spinalAPIMiddleware,
        parseInt(req.params.id, 10),
        profileId,
        TICKET_CONTEXT_TYPE
      );

      // check if the name already exists in another context
      const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
      const childrens = await graph.getChildren('hasContext');
      if (
        childrens.some((child) => {
          return child.info.name?.get() === req.body.newNameWorkflow;
        })
      ) {
        return res.status(400).send('the name context already exists');
      }

      workflowNode.info.name.set(req.body.newNameWorkflow);
      return res.status(200).send('Success');
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(400).send(error?.message);
    }
  });
};
