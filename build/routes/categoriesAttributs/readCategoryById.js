"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{nodeId}/categoryById/{categoryId}/read:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read one attribute category of a node, by ID
     *     description: >-
     *       Returns a single attribute category (`dynamicId`, `staticId`, `name`, `type`) after checking
     *       that it really is attached to the given node. The attributes it holds are not returned - use
     *       `/api/v1/node/{id}/attribute_list` for those.
     *
     *
     *       When the category is not one of the node's categories the request fails with a 500 rather
     *       than a clean 400.
     *     tags:
     *       - Node Attribut Categories
     *     parameters:
     *      - in: path
     *        name: nodeId
     *        description: Dynamic ID of the node.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: categoryId
     *        description: Dynamic ID of the category.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The category.
     *         content:
     *           application/json:
     *             schema:
     *              $ref: '#/components/schemas/CategoriesAttribute'
     *       400:
     *         description: The category is not attached to the node ("category not found in node").
     *       401:
     *         description: The profile is not allowed to read the node or the category.
     *       500:
     *         description: The node or the category could not be loaded, or the category is not attached to the node.
     */
    app.get('/api/v1/node/:nodeId/categoryById/:categoryId/read', async (req, res, next) => {
        let info;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);
            const childrens = await node.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            for (let index = 0; index < childrens.length; index++) {
                if (childrens[index] === category) {
                    info = {
                        dynamicId: category._server_id,
                        staticId: category.getId().get(),
                        name: category.getName().get(),
                        type: category.getType().get(),
                    };
                }
            }
            if (Object.keys(info).length === 0) {
                res.status(400).send('category not found in node');
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(info);
    });
};
//# sourceMappingURL=readCategoryById.js.map