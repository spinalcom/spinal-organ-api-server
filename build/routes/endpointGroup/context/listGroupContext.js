"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_plugin_group_manager_service_1 = __importDefault(require("spinal-env-viewer-plugin-group-manager-service"));
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/endPointsGroup/list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the group contexts
     *     description: >-
     *       Returns every group context the profile can reach, with its name, type and display colour.
     *       Use a returned `dynamicId` to reach its categories with `/api/v1/endPointsGroup/{id}/category_list`.
     *
     *
     *       Note that this listing is **not filtered by type** : it returns the group contexts of every
     *       family, not only the endpoint ones.
     *
     *     tags:
     *       - EndPoints Group
     *     responses:
     *       200:
     *         description: The group contexts (an empty array if there are none).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Context'
     *       400:
     *         description: The profile graph could not be read.
     *       401:
     *         description: The profile is not allowed to read the graph.
     */
    app.get("/api/v1/endPointsGroup/list", async (req, res, next) => {
        const nodes = [];
        try {
            const profilId = (0, requestUtilities_1.getProfileId)(req);
            const graph = await spinalAPIMiddleware.getProfileGraph(profilId);
            const groupContexts = await spinal_env_viewer_plugin_group_manager_service_1.default.getGroupContexts(undefined, graph);
            for (let index = 0; index < groupContexts.length; index++) {
                const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(groupContexts[index].id);
                if (realNode.getType().get() === "BmsEndpointGroupContext") {
                    const info = {
                        dynamicId: realNode._server_id,
                        staticId: realNode.getId().get(),
                        name: realNode.getName().get(),
                        type: realNode.getType().get()
                    };
                    nodes.push(info);
                }
            }
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of group contexts is not loaded");
        }
        res.send(nodes);
    });
};
//# sourceMappingURL=listGroupContext.js.map