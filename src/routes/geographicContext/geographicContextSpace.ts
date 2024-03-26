/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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

// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { SpinalContext, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { ContextTree } from '../contexts/interfacesContexts'
import { recTreeDepth } from '../../utilities/recTree'
import { getProfileId } from '../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
  /**
 * @swagger
 * /api/v1/geographicContext/space:
 *   get:
 *     security: 
 *       - bearerAuth: 
 *         - readOnly
 *     description: Return space tree of context
 *     summary: Get a space tree context
 *     tags:
 *       - Geographic Context
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema: 
 *                $ref: '#/components/schemas/ContextTree'
 *       400:
 *         description: Bad request
 */

  app.get("/api/v1/geographicContext/space", async (req, res, next) => {
    let contexts: ContextTree;
    try {
      const profileId = getProfileId(req);
      const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
      const temp_contexts = await userGraph.getChildren("hasContext");

      const geographicContexts = temp_contexts.filter(el => el.getType().get() === "geographicContext");
      const geographicContext = geographicContexts[0];
      if (geographicContext instanceof SpinalContext) {
        contexts = {
          dynamicId: geographicContext._server_id,
          staticId: geographicContext.getId().get(),
          name: geographicContext.getName().get(),
          type: geographicContext.getType().get(),
          context: (geographicContext instanceof SpinalContext ? "SpinalContext" : ""),
          children: await recTreeDepth(geographicContext, geographicContext, 3)
        };
      }
    } catch (error) {
      console.error(error);
      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json(contexts);
  });
};

/**
 * @swagger
 * components:
 *   schemas:
 *     ContextTree:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 *         context:
 *           type: "string"
 *         children:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/ContextTree"
 *       example:
 *         dynamicId: 377295296
 *         staticId: SpinalContext-b61aca38-c262-56bd-9b3b-72fba07999a4-173a52a9bd8
 *         name: Scenes
 *         type: SpinalService
 *         context: SpinalContext
 *         children:
 *         - dynamicId: 377301280
 *           staticId: SpinalNode-c04c8302-ef21-7fa1-3435-8bf1ecd717b8-173a52a9bde
 *           name: sqdsq
 *           type: scene
 *           children: []
 */
