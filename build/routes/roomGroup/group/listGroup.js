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
     * /api/v1/roomsGroup/{contextId}/category/{categoryId}/group_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Return list of group roomsGroup
     *     summary: Gets a list of group roomsGroup
     *     tags:
     *       - Rooms Group
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
    app.get('/api/v1/roomsGroup/:contextId/category/:categoryId/group_list', async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            if (!(context instanceof spinal_env_viewer_graph_service_1.SpinalContext)) {
                return res
                    .status(400)
                    .send('The context Id provided does not represent a context');
            }
            if (!category.belongsToContext(context)) {
                return res
                    .status(400)
                    .send('The category does not belong to the context');
            }
            if (context.getType().get() !== 'geographicRoomGroupContext') {
                return res
                    .status(400)
                    .send('The context is not a geographicRoomGroupContext');
            }
            const listGroups = await spinal_env_viewer_plugin_group_manager_service_1.default.getGroups(category.getId().get());
            for (const group of listGroups) {
                // @ts-ignore
                const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(group.id.get());
                const info = {
                    dynamicId: realNode._server_id,
                    staticId: realNode.getId().get(),
                    name: realNode.getName().get(),
                    type: realNode.getType().get(),
                    color: group.color.get(),
                    icon: group.icon?.get(),
                };
                nodes.push(info);
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send('ko');
        }
        res.send(nodes);
    });
};
//# sourceMappingURL=listGroup.js.map