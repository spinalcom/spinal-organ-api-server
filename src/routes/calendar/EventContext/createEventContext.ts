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

import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalEventService } from "spinal-env-viewer-task-service";
import { ContextEvent } from '../interfacesContextsEvents'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
* @swagger
* /api/v1/eventContext/create:
*   post:
*     security: 
*       - bearerAuth: 
*         - read
*     description: create event context
*     summary: create event context
*     tags:
*       - Calendar & Event
*     requestBody:
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - configEventContext
*             properties:
*                contextName:
*                 type: string
*     responses:
*       200:
*         description: Success
*         content:
*           application/json:
*             schema: 
*                $ref: '#/components/schemas/Context'
*       400:
*         description: Bad request
*/



  app.post("/api/v1/eventContext/create", async (req, res, next) => {

    try {
      const steps = []
      const graph = await spinalAPIMiddleware.getGraph();
      await SpinalGraphService.setGraph(graph);
      
      const profileId = getProfileId(req);
      const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);

      if (!userGraph) res.status(406).send(`No graph found for ${profileId}`);

      const info = await SpinalEventService.createEventContext(req.body.contextName, steps);
      const context = SpinalGraphService.getRealNode(info.id.get());

      userGraph.addContext(context);

      res.status(200).json({
        name: context.getName().get(),
        staticId: context.getId().get(),
        type: context.getType().get(),
        steps: context.info.steps?.get()
      });

    } catch (error) {
      console.error(error)
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
  })

}
