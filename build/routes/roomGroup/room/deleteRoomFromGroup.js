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
     * /api/v1/roomsGroup/{contextId}/category/{categoryId}/group/{groupId}/deleteRooms:
     *   delete:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Remove rooms from a group
     *     description: >-
     *       Takes rooms out of a group of a room group context. The body is an array of room dynamic IDs.
     *
     *
     *       The rooms themselves are **not** deleted : they stay in the geographic context and only lose
     *       this grouping. An empty array is rejected.
     *     tags:
     *       - Rooms Group
     *     parameters:
     *       - in: path
     *         name: contextId
     *         description: Dynamic ID of the room group context.
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
     *       description: The dynamic IDs of the rooms to remove.
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *     responses:
     *       200:
     *         description: The rooms were removed from the group.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: >-
     *           The array is empty ("list of room id is empty"), or the category or the group does not
     *           belong to the context ("category or group not found in context").
     *       401:
     *         description: The profile is not allowed to write on this context.
     */
    app.delete('/api/v1/roomsGroup/:contextId/category/:categoryId/group/:groupId/deleteRooms', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const _roomList = req.body;
            const context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            const group = await spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(group);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext && category.belongsToContext(context) && group.belongsToContext(context)) {
                if (context.getType().get() === 'geographicRoomGroupContext') {
                    if (_roomList.length > 0) {
                        for (let index = 0; index < _roomList.length; index++) {
                            const realNode = await spinalAPIMiddleware.load(parseInt(_roomList[index], 10));
                            //@ts-ignore
                            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(realNode);
                            if (realNode.getType().get() === 'geographicRoom') {
                                spinal_env_viewer_plugin_group_manager_service_1.default.unLinkElementToGroup(group.getId().get(), realNode.getId().get());
                            }
                            else {
                                res
                                    .status(400)
                                    .send('one of nodes is not type of geographicRoom');
                            }
                        }
                    }
                    else {
                        res.status(400).send(' list of room id is empty ');
                    }
                }
                else {
                    res
                        .status(400)
                        .send('node is not type of geographicRoomGroupContext ');
                }
            }
            else {
                res.status(400).send('category or group not found in context');
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('ko');
        }
        res.json();
    });
};
//# sourceMappingURL=deleteRoomFromGroup.js.map