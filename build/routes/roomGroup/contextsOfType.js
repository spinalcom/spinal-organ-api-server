"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/groupContext/contextsOfType/{type}:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: Return nodes of type in context
  *     summary: Gets a nodes of type with given ID context and Type
  *     tags:
  *      - Group Context
  *     parameters:
  *      - in: path
  *        name: type
  *        required: true
  *        schema:
  *          type: string
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *               type: array
  *               items:
  *                $ref: '#/components/schemas/ContextNodeofTypes'
  *       400:
  *         description: Bad request
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