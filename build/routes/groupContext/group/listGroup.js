"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/groupeContext/{contextId}/category/{categoryId}/group_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Return list of group
   *     summary: Gets a list of group
   *     tags:
   *      - Group Context
   *     parameters:
   *      - in: path
   *        name: contextId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: categoryId
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
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/CategoryEvent'
   *       400:
   *         description: Bad request
    */
    app.get("/api/v1/groupeContext/:contextId/category/:categoryId/group_list", async (req, res, next) => {
        let nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            var category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext && category.belongsToContext(context)) {
                var listGroups = await spinal_env_viewer_plugin_group_manager_service_1.default.getGroups(category.getId().get());
                for (const group of listGroups) {
                    // @ts-ignore
                    const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(group.id.get());
                    let info = {
                        dynamicId: realNode._server_id,
                        staticId: realNode.getId().get(),
                        name: realNode.getName().get(),
                        type: realNode.getType().get(),
                        color: group.color.get()
                    };
                    nodes.push(info);
                }
            }
            else {
                res.status(400).send("category not found in context");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of category event is not loaded");
        }
        res.send(nodes);
    });
};
//# sourceMappingURL=listGroup.js.map