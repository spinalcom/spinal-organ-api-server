"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_group_manager_service_1 = __importDefault(require("spinal-env-viewer-plugin-group-manager-service"));
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/groupContext/contextsOfType/{type}:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the group contexts of a given type
     *     description: >-
     *       Returns the group contexts of one type, which is how you find the contexts of a single family
     *       rather than all of them like `/api/v1/groupContext/list` does.
     *
     *
     *       `type` is one of the values returned by `/api/v1/groupContext/type_list`, for instance
     *       `geographicRoomGroupContext`, `BIMObjectGroupContext`, `BmsEndpointGroupContext` or
     *       `AttributeConfigurationGroupContext`.
     *     tags:
     *       - Group Context
     *     parameters:
     *       - in: path
     *         name: type
     *         description: Group context type to filter on.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: The group contexts of that type (an empty array if there are none).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/ContextNodeofTypes'
     *       401:
     *         description: The profile is not allowed to read the graph.
     *       500:
     *         description: The profile graph could not be read.
     */
    app.get("/api/v1/groupContext/contextsOfType/:type", async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const groupContexts = await spinal_env_viewer_plugin_group_manager_service_1.default.getGroupContexts(req.params.type, graph);
            for (let index = 0; index < groupContexts.length; index++) {
                const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(groupContexts[index].id);
                const info = {
                    dynamicId: realNode._server_id,
                    staticId: realNode.getId().get(),
                    name: realNode.getName().get(),
                    type: realNode.getType().get()
                };
                nodes.push(info);
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(nodes);
    });
};
//# sourceMappingURL=contextsOfType.js.map