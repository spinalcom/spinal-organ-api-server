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
     * /api/v1/groupContext/{contextId}/category/{categoryId}/group/{groupId}/unassign_items:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Unassign items from a group
     *     description: >-
     *       Takes items out of a group, whatever the family of the group context - the generic
     *       counterpart of the `deleteRooms` / `deleteEquipement` / `deleteEndpoint` routes.
     *
     *
     *       The body is a non-empty array of item dynamic IDs. The items themselves are **not** deleted :
     *       they stay in their own context and only lose this grouping. The response lists the items that
     *       were actually unassigned, so an ID that was not in the group simply does not appear in it.
     *     tags:
     *       - Group Context
     *     parameters:
     *       - in: path
     *         name: contextId
     *         description: Dynamic ID of the group context.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: categoryId
     *         description: Dynamic ID of the category, which must belong to that context.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: groupId
     *         description: Dynamic ID of the group, which must belong to that context.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     requestBody:
     *       required: true
     *       description: The dynamic IDs of the items to unassign.
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *     responses:
     *       200:
     *         description: The items that were unassigned from the group.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: >-
     *           The body is not a non-empty array ("Request body must be a non-empty array of dynamic
     *           IDs"), `contextId` is not a context, or the category or the group does not belong to it.
     *       401:
     *         description: The profile is not allowed to write on this context.
     */
    app.post('/api/v1/groupContext/:contextId/category/:categoryId/group/:groupId/unassign_items', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const itemIds = req.body;
            if (!Array.isArray(itemIds) || itemIds.length === 0) {
                return res.status(400).send('Request body must be a non-empty array of dynamic IDs');
            }
            const context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            const group = await spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(group);
            if (!(context instanceof spinal_env_viewer_graph_service_1.SpinalContext)) {
                return res.status(400).send('The contextId does not represent a context');
            }
            if (!category.belongsToContext(context)) {
                return res.status(400).send('The category does not belong to the context');
            }
            if (!group.belongsToContext(context)) {
                return res.status(400).send('The group does not belong to the context');
            }
            const unassigned = [];
            for (const itemId of itemIds) {
                const node = await spinalAPIMiddleware.load(parseInt(String(itemId), 10), profileId);
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
                await spinal_env_viewer_plugin_group_manager_service_1.default.unLinkElementToGroup(group.getId().get(), node.getId().get());
                unassigned.push({
                    dynamicId: node._server_id,
                    staticId: node.getId().get(),
                    name: node.getName().get(),
                    type: node.getType().get(),
                });
            }
            return res.json(unassigned);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message || 'ko');
        }
    });
};
//# sourceMappingURL=unassignItem.js.map