/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
import {
  removeStepFromProcess,
  PROCESS_TYPE,
  STEP_TYPE,
} from 'spinal-service-ticket';
import { getProfileId } from '../../../utilities/requestUtilities';
import { getWorkflowContextNode } from '../../../utilities/workflow/getWorkflowContextNode';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/workflow/{workflowId}/process/{processId}/step/{stepId}/delete_step:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: Delete a step
   *     summary: delete an step
   *     tags:
   *       - Workflow & ticket
   *     parameters:
   *      - in: path
   *        name: workflowId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: processId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: stepId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: Delete Successfully
   *       400:
   *         description: Bad request
   */

  app.delete(
    '/api/v1/workflow/:workflowId/process/:processId/step/:stepId/delete_step',
    async (req, res) => {
      // check if workflowId, processId and stepId are valid
      if (!req.params.workflowId || isNaN(+req.params.workflowId))
        return res.status(400).send('Invalid workflowId');
      if (!req.params.processId || isNaN(+req.params.processId))
        return res.status(400).send('Invalid processId');
      if (!req.params.stepId || isNaN(+req.params.stepId))
        return res.status(400).send('Invalid stepId');

      try {
        const profileId = getProfileId(req);
        const [workflowContextNode, processNode, stepNode] = await Promise.all([
          getWorkflowContextNode(
            spinalAPIMiddleware,
            profileId,
            req.params.workflowId
          ),
          loadAndValidateNode(
            spinalAPIMiddleware,
            parseInt(req.params.processId, 10),
            profileId,
            PROCESS_TYPE
          ),
          loadAndValidateNode(
            spinalAPIMiddleware,
            parseInt(req.params.stepId, 10),
            profileId,
            STEP_TYPE
          ),
        ]);

        await removeStepFromProcess(processNode, workflowContextNode, stepNode);
        return res.status(204).end();
      } catch (error) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res.status(500).send(error?.message);
      }
    }
  );
};
