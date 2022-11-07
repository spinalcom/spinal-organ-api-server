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

import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/workflow/{id}/nodeTypeList:
 *   get:
 *     security:
 *       - OauthSecurity:
 *         - readOnly
 *     description: Return node type list of workflow
 *     summary: Get type list in workflow with given ID 
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
 *                $ref: '#/components/schemas/WorkflowNodeTypeList'
 *       400:
 *         description: Bad request
 */

  app.get("/api/v1/workflow/:id/nodeTypeList", async (req, res, next) => {

    try {
      var workflow = await spinalAPIMiddleware.load(parseInt(req.params.id, 10));
      var SpinalContextId = workflow.getId().get();
      if (workflow.getType().get() === "SpinalSystemServiceTicket") {
        var type_list = await SpinalGraphService.browseAndClassifyByTypeInContext(SpinalContextId, SpinalContextId);
      }
      else {
        res.status(400).send("this context is not a SpinalSystemServiceTicket");
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("context not found");
    }
    res.json(type_list.types);
  });

};

