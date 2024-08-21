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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/roomsGroup/{contextId}/category/{categoryId}/group/{groupId}/addRooms:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: add room list
     *     summary: add room
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
     *      - in: path
     *        name: groupId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     requestBody:
     *       description: array of string (dynamicId)
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: number
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: Bad request
     */
    app.post('/api/v1/roomsGroup/:contextId/category/:categoryId/group/:groupId/addRooms', async (req, res, next) => {
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
            if (!(context instanceof spinal_env_viewer_graph_service_1.SpinalContext)) {
                return res.status(400).send("The context id provided does not refer to a context");
            }
            if (context.getType().get() !== "geographicRoomGroupContext") {
                return res.status(400).send("The context is not a geographicRoomGroupContext");
            }
            if (!(category.belongsToContext(context))) {
                return res.status(400).send("The category provided does not belong to the context");
            }
            if (!(group.belongsToContext(context))) {
                return res.status(400).send("The group provided does not belong to the context");
            }
            const promises = _roomList.map((dynamicId) => linkRoomToGroup(spinalAPIMiddleware, profileId, dynamicId, context.getId().get(), group.getId().get()));
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    console.error(`Error with dynamicId ${_roomList[index]}: ${result.reason}`);
                    return {
                        dynamicId: _roomList[index],
                        error: result.reason?.message || result.reason || "Failed to link to group"
                    };
                }
            });
            const isGotError = settledResults.some(result => result.status === 'rejected');
            if (isGotError)
                return res.status(206).json(finalResults);
            return res.status(200).json(finalResults);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('ko');
        }
    });
    async function linkRoomToGroup(spinalAPIMiddleware, profileId, dynamicId, contextId, groupId) {
        const realNode = await spinalAPIMiddleware.load(dynamicId, profileId);
        //@ts-ignore
        spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(realNode);
        if (realNode.getType().get() !== 'geographicRoom') {
            throw new Error(`Node with dynamicId ${dynamicId} is not a geographicRoom`);
        }
        const linkResult = await spinal_env_viewer_plugin_group_manager_service_1.default.linkElementToGroup(contextId, groupId, realNode.getId().get());
        return { dynamicId: dynamicId, ...linkResult };
    }
};
//# sourceMappingURL=addRoomList.js.map