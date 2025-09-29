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

import * as express from 'express';
import {
  TICKET_CONTEXT_TYPE,
  PROCESS_TYPE,
  STEP_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
} from 'spinal-service-ticket';

module.exports = function (logger, app: express.Express) {
  /**
   * @swagger
   * /api/v1/workflow/{id}/nodeTypeList:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Return node type list of workflow
   *     summary: Get type list in workflow
   *     tags:
   *       - Workflow & ticket
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/WorkflowNodeTypeList'
   */

  app.get('/api/v1/workflow/:id/nodeTypeList', async (req, res) => {
    return res
      .status(200)
      .json([
        TICKET_CONTEXT_TYPE,
        PROCESS_TYPE,
        STEP_TYPE,
        SPINAL_TICKET_SERVICE_TICKET_TYPE,
      ]);
  });
};
