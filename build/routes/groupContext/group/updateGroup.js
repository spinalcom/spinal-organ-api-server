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
     * /api/v1/groupContext/{contextId}/category/{categoryId}/group/{groupId}/update:
     *   put:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Rename a group and change its colour
     *     description: >-
     *       Updates the name and the colour of a group. Both fields are applied, so send the current
     *       colour to keep it. The category and the group must belong to the given context.
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
     *         description: Dynamic ID of the group, which must belong to that category.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - newNameGroup
     *             properties:
     *               newNameGroup:
     *                 type: string
     *               newNameColor:
     *                 type: string
     *                 description: New display colour.
     *     responses:
     *       200:
     *         description: The updated group.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: >-
     *           The context, category or group could not be resolved ("context not found",
     *           "category not found", "group not found").
     *       401:
     *         description: The profile is not allowed to write on this context.
     */
    app.put("/api/v1/groupContext/:contextId/category/:categoryId/group/:groupId/update", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            const group = await spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(group);
            if (!context || !(context instanceof spinal_env_viewer_graph_service_1.SpinalContext)) {
                res.status(400).send("context not found");
                return;
            }
            if (!category || !category.belongsToContext(context)) {
                res.status(400).send("category not found");
                return;
            }
            if (!group || !group.belongsToContext(context)) {
                res.status(400).send("group not found");
                return;
            }
            const dataObject = {
                name: req.body.newNameGroup,
                color: req.body.newNameColor
            };
            const nodeRef = await spinal_env_viewer_plugin_group_manager_service_1.default.updateGroup(group.getId().get(), dataObject);
            return res.status(200).json({
                id: nodeRef.id.get(),
                name: nodeRef.name.get(),
                color: nodeRef.color.get()
            });
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send(error.message);
        }
    });
};
//# sourceMappingURL=updateGroup.js.map