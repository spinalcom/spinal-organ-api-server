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
import * as express from 'express';
import { getAllTicketProcess } from 'spinal-service-ticket';
import { getProfileId } from '../../../utilities/requestUtilities';
import { getWorkflowContextNode } from 'src/utilities/workflow/getWorkflowContextNode';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/workflow/{id}/processList:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Returns list of process
   *     summary: Get list of process
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
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Process'
   *       400:
   *         description: Bad request
   */
  app.get('/api/v1/workflow/:id/processList', async (req, res, next) => {
    try {
      await spinalAPIMiddleware.getGraph();
      const profileId = getProfileId(req);
      const workflowContextNode = await getWorkflowContextNode(
        spinalAPIMiddleware,
        profileId,
        req.params.id
      );
      const processNodes = await getAllTicketProcess(workflowContextNode);
      const nodes: Workflow[] = [];

      for (const processNode of processNodes) {
        const info: Workflow = {
          dynamicId: processNode._server_id,
          staticId: processNode.info.id?.get() || undefined,
          name: processNode.info.name?.get() || undefined,
          type: processNode.info.type?.get() || undefined,
          color: processNode.info.color?.get() || undefined,
        };
        nodes.push(info);
      }
      return res.json(nodes);
    } catch (error) {
      if (error.code && error.message)
        return res.status(error.code).send(error.message);
      return res.status(500).send(error.message);
    }
  });
};
