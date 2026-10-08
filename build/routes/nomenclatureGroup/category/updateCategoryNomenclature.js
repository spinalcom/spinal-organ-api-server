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
     * /api/v1/nomenclatureGroup/{contextId}/category/{categoryId}/update:
     *   put:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Rename a category of a group context
     *     description: >-
     *       Renames a category and sets its icon. The category must belong to the given context.
     *
     *
     *       Both fields are applied, so send the current icon to keep it. A successful call answers
     *       **200 with an empty body**.
     *     tags:
     *       - Nomenclature Group
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
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - newNameCategory
     *             properties:
     *               newNameCategory:
     *                 type: string
     *               newNameIcon:
     *                 type: string
     *                 description: New display icon.
     *     responses:
     *       200:
     *         description: The category was renamed. The body is empty.
     *       400:
     *         description: The category does not belong to the context ("category not found in context").
     *       401:
     *         description: The profile is not allowed to write on this context.
     */
    app.put("/api/v1/nomenclatureGroup/:contextId/category/:categoryId/update", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext && category.belongsToContext(context)) {
                if (context.getType().get() === "AttributeConfigurationGroupContext") {
                    const dataObject = {
                        name: req.body.newNameCategory,
                        icon: req.body.newNameIcon
                    };
                    const categoryUpdated = await spinal_env_viewer_plugin_group_manager_service_1.default.updateCategory(category.getId().get(), dataObject);
                    var info = {
                        dynamicId: categoryUpdated._server_id,
                        staticId: categoryUpdated.getId().get(),
                        name: categoryUpdated.getName().get(),
                        type: categoryUpdated.getType().get(),
                        icon: categoryUpdated.info.icon.get()
                    };
                }
                else {
                    res.status(400).send("node is not type of AttributeConfigurationGroupContext ");
                }
            }
            else {
                res.status(400).send("category not found in context");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send(error.message);
        }
        res.json(info);
    });
};
//# sourceMappingURL=updateCategoryNomenclature.js.map