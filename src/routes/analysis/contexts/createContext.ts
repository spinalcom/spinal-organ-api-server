import * as express from 'express';
import { getProfileId } from '../../../utilities/requestUtilities';
import { ISpinalAPIMiddleware } from '../../../interfaces';
import { spinalAnalyticNodeManagerService , VERSION, CONSTANTS } from "spinal-model-analysis";
import { awaitSync } from '../../../utilities/awaitSync';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

/**
 * @swagger
 * /api/v1/analysis/contexts:
 *   post:
 *     security:
 *       - bearerAuth:
 *           - write
 *     summary: Create an analysis context
 *     description: Creates a new analysis context node and returns its information
 *     tags:
 *       - Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contextName
 *             properties:
 *               contextName:
 *                 type: string
 *                 description: Name of the analysis context to create
 *                 example: Energy Analysis
 *     responses:
 *       200:
 *         description: Analysis context successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: Created analysis context node information
 *                 meta:
 *                   type: object
 *                   properties:
 *                     analysisModuleVersion:
 *                       type: string
 *                       description: Version of spinal-model-analysis used
 *       400:
 *         description: Bad request
 */

  app.post("/api/v1/analysis/contexts", async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const contextName = req.body.contextName;
      const nodeInfo = await spinalAnalyticNodeManagerService.createContext(contextName);
      const node = SpinalGraphService.getRealNode(nodeInfo.id.get());
      await awaitSync(node)

      const entities = [
        {name: "Building", standard_name: "Building", entityType: CONSTANTS.ENTITY_TYPES.BUILDING, description: ""},
        {name: "Floor", standard_name: "Floor", entityType: CONSTANTS.ENTITY_TYPES.FLOOR, description: ""},
        {name: "Room", standard_name: "Room", entityType: CONSTANTS.ENTITY_TYPES.ROOM, description: ""},
        {name: "Equipment", standard_name: "Equipment", entityType: CONSTANTS.ENTITY_TYPES.EQUIPMENT, description: ""},
        {name: "Floor Group", standard_name: "Floor Group", entityType: CONSTANTS.ENTITY_TYPES.FLOOR_GROUP, description: ""},
        {name: "Room Group", standard_name: "Room Group", entityType: CONSTANTS.ENTITY_TYPES.ROOM_GROUP, description: ""},
        {name: "Equipment Group", standard_name: "Equipment Group", entityType: CONSTANTS.ENTITY_TYPES.EQUIPMENT_GROUP, description: ""},
      ]


      const createdEntities = [];
      for (const ent of entities) {
        const entityInfo = await spinalAnalyticNodeManagerService.addEntity(ent, node.getId().get());
        const entityNode = SpinalGraphService.getRealNode(entityInfo.id.get());
        await awaitSync(entityNode);
        createdEntities.push(entityNode);

      }


      return res.json({
        data: {
          id: node._server_id,
          name: node.getName().get(),
          type: node.getType().get(),
          entities : createdEntities.map(e => {
            return {
              id: e._server_id,
              name: e.getName().get(),
              standard_name: e.info.standard_name.get(),
              type: e.getType().get(),
              entityType: e.info.entityType.get()
            }
          })
        },
        meta: {
          analysisModuleVersion : VERSION
        }
      });

    } catch (error: any) {
      if (error?.code && error?.message) {
        return res.status(error.code).send(error.message);
      }
      if (error?.message) {
        return res.status(400).send(error.message);
      }
      console.error(error);
      return res.status(400).send(error);
    }
  });
}
