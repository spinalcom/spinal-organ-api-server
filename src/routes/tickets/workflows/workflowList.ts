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
import { Workflow } from '../interfacesWorkflowAndTickets'
import { profile } from 'console';
import { getProfileId } from '../../../utilities/requestUtilities';
import { SERVICE_TYPE } from 'spinal-service-ticket'
module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/workflow/list:
 *   get:
 *     security: 
 *       - OauthSecurity: 
 *         - readOnly
 *     description: Return list of workflows
 *     summary: Gets a list of workflows
 *     tags:
 *      - Workflow & ticket
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema: 
 *               type: array
 *               items: 
 *                $ref: '#/components/schemas/Workflow'
 *       400:
 *         description: Bad request
  */

  app.get("/api/v1/workflow/list", async (req, res, next) => {

    let nodes = [];
    try {
      const profileId = getProfileId(req);
      var childrens = await spinalAPIMiddleware.getGraph(profileId).getChildren("hasContext");

      for (const child of childrens) {
        if (child.getType().get() === SERVICE_TYPE) {
          let info: Workflow = {
            dynamicId: child._server_id,
            staticId: child.getId().get(),
            name: child.getName().get(),
            type: child.getType().get()
          };
          nodes.push(info);
        }
      }

      res.send(nodes);


    } catch (error) {
      console.error(error);
      res.status(400).send("list of worflows is not loaded");
    }
  });
};
