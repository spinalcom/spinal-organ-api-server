"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_analysis_1 = require("spinal-model-analysis");
const awaitSync_1 = require("../../../utilities/awaitSync");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
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
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextName = req.body.contextName;
            const nodeInfo = await spinal_model_analysis_1.spinalAnalyticNodeManagerService.createContext(contextName);
            const node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(nodeInfo.id.get());
            await (0, awaitSync_1.awaitSync)(node);
            const entities = [
                { name: "Building", standard_name: "Building", entityType: spinal_model_analysis_1.CONSTANTS.ENTITY_TYPES.BUILDING, description: "" },
                { name: "Floor", standard_name: "Floor", entityType: spinal_model_analysis_1.CONSTANTS.ENTITY_TYPES.FLOOR, description: "" },
                { name: "Room", standard_name: "Room", entityType: spinal_model_analysis_1.CONSTANTS.ENTITY_TYPES.ROOM, description: "" },
                { name: "Equipment", standard_name: "Equipment", entityType: spinal_model_analysis_1.CONSTANTS.ENTITY_TYPES.EQUIPMENT, description: "" },
                { name: "Floor Group", standard_name: "Floor Group", entityType: spinal_model_analysis_1.CONSTANTS.ENTITY_TYPES.FLOOR_GROUP, description: "" },
                { name: "Room Group", standard_name: "Room Group", entityType: spinal_model_analysis_1.CONSTANTS.ENTITY_TYPES.ROOM_GROUP, description: "" },
                { name: "Equipment Group", standard_name: "Equipment Group", entityType: spinal_model_analysis_1.CONSTANTS.ENTITY_TYPES.EQUIPMENT_GROUP, description: "" },
            ];
            const createdEntities = [];
            for (const ent of entities) {
                const entityInfo = await spinal_model_analysis_1.spinalAnalyticNodeManagerService.addEntity(ent, node.getId().get());
                const entityNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(entityInfo.id.get());
                await (0, awaitSync_1.awaitSync)(entityNode);
                createdEntities.push(entityNode);
            }
            return res.json({
                data: {
                    id: node._server_id,
                    name: node.getName().get(),
                    type: node.getType().get(),
                    entities: createdEntities.map(e => {
                        return {
                            id: e._server_id,
                            name: e.getName().get(),
                            standard_name: e.info.standard_name.get(),
                            type: e.getType().get(),
                            entityType: e.info.entityType.get()
                        };
                    })
                },
                meta: {
                    analysisModuleVersion: spinal_model_analysis_1.VERSION
                }
            });
        }
        catch (error) {
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
};
//# sourceMappingURL=createContext.js.map