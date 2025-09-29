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

import { SpinalContext } from 'spinal-model-graph';
import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import {
  getAllTicketProcess,
  getStepNodesFromProcess,
  TICKET_CONTEXT_TYPE,
} from 'spinal-service-ticket';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/workflow/{id}/delete:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: Delete a workflow
   *     summary: this will delete an workflow but also delete the related Process and Steps but NOT the tickets
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
   *         description: Delete Successfully
   *       400:
   *         description: Bad request
   */

  app.delete('/api/v1/workflow/:id/delete', async (req, res) => {
    try {
      const profileId = getProfileId(req);
      const workflowNode: SpinalContext = await loadAndValidateNode(
        spinalAPIMiddleware,
        parseInt(req.params.id, 10),
        profileId,
        TICKET_CONTEXT_TYPE
      );
      const proms: Promise<void>[] = [];
      const processNodes = await getAllTicketProcess(workflowNode);
      for (const processNode of processNodes) {
        const stepNodes = await getStepNodesFromProcess(
          processNode,
          workflowNode
        );
        for (const stepNode of stepNodes) {
          proms.push(stepNode.removeFromGraph());
        }
        proms.push(processNode.removeFromGraph());
      }
      proms.push(workflowNode.removeFromGraph());
      await Promise.all(proms);
      return res.status(200).send('Delete Successfully');
    } catch (error) {
      if (error?.code && error?.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error?.message);
    }
  });
};
