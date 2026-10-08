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
     * /api/v1/equipementsGroup/{contextId}/category/{categoryId}/group/{groupId}/deleteEquipement:
     *   delete:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Remove equipment from a group
     *     description: >-
     *       Takes BIM objects out of a group of an equipment group context. The body is an array of
     *       dynamic IDs.
     *
     *
     *       The equipment itself is **not** deleted : it stays in the geographic context and only loses
     *       this grouping. An empty array is rejected.
     *     tags:
     *       - Equipements Group
     *     parameters:
     *       - in: path
     *         name: contextId
     *         description: Dynamic ID of the equipment group context.
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
     *       description: The dynamic IDs of the equipment to remove.
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: integer
     *               format: int64
     *     responses:
     *       200:
     *         description: The equipment was removed from the group.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: >-
     *           One of the nodes is not a `BIMObject`, the array is empty, the context is not a
     *           `BIMObjectGroupContext`, or the category or the group does not belong to it.
     *       401:
     *         description: The profile is not allowed to write on this context.
     */
    app.delete('/api/v1/equipementsGroup/:contextId/category/:categoryId/group/:groupId/deleteEquipement', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const _equipementList = req.body;
            const context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            const group = await spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(group);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext &&
                category.belongsToContext(context) &&
                group.belongsToContext(context)) {
                if (context.getType().get() === 'BIMObjectGroupContext') {
                    if (_equipementList.length > 0) {
                        for (let index = 0; index < _equipementList.length; index++) {
                            const realNode = await spinalAPIMiddleware.load(_equipementList[index]);
                            //@ts-ignore
                            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(realNode);
                            if (realNode.getType().get() === 'BIMObject') {
                                spinal_env_viewer_plugin_group_manager_service_1.default.unLinkElementToGroup(group.getId().get(), realNode.getId().get());
                            }
                            else {
                                res.status(400).send('one of nodes is not type of BIMObject');
                            }
                        }
                    }
                    else {
                        res.status(400).send(' list of equipement id is empty ');
                    }
                }
                else {
                    res.status(400).send('node is not type of BIMObjectGroupContext ');
                }
            }
            else {
                res.status(400).send('category or group not found in context');
            }
            res.json();
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('ko');
        }
    });
};
//# sourceMappingURL=deleteEquipementFromGroup.js.map