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
import { SpinalEventService, CONTEXT_TYPE } from "spinal-env-viewer-task-service";
import { ContextEvent } from '../interfacesContextsEvents'
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
   * @swagger
   * /api/v1/eventContext/list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the event contexts
   *     description: >-
   *       Returns every context of type `SpinalEventGroupContext` the profile can reach - the calendars
   *       of the twin. Events are organised as context -> category -> group -> event.
   *     tags:
   *       - Calendar & Event
   *     responses:
   *       200:
   *         description: The event contexts (an empty array if there are none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/ContextEvent'
   *       400:
   *         description: The profile graph could not be read ("list of contexts events is not loaded").
   *       401:
   *         description: The profile is not allowed to read the graph.
   */

  app.get('/api/v1/eventContext/list', async (req, res, next) => {
    try {
      const nodes = [];
      const profileId = getProfileId(req);
      const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);

      const contexts = userGraph ? await userGraph.getChildren("hasContext") : []
      const listContextEvents = contexts.filter(context => context.getType().get() === CONTEXT_TYPE);

      for (const _child of listContextEvents) {
        // @ts-ignore
        // const _child = SpinalGraphService.getRealNode(child.id.get())
        if (_child.getType().get() === CONTEXT_TYPE) {
          const info: ContextEvent = {
            dynamicId: _child._server_id,
            staticId: _child.getId().get(),
            name: _child.getName().get(),
            type: _child.getType().get(),
          };
          nodes.push(info);
        }
      }

      res.send(nodes);
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(400).send("list of contexts events is not loaded");
    }
  });
};
