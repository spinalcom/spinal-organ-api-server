"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/{id}/categoriesList:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the attribute categories of a node
     *     description: >-
     *       Returns the attribute categories attached to a node, **without** their attributes : only
     *       `dynamicId`, `staticId`, `name` and `type` of each category. Use
     *       `/api/v1/node/{id}/attribute_list` to get the categories together with their attributes.
     *     tags:
     *       - Node Attribut Categories
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the node.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The attribute categories of the node (an empty array if it has none).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/CategoriesAttribute'
     *       401:
     *         description: The profile is not allowed to read this node.
     *       500:
     *         description: The node could not be loaded or its categories could not be read.
     */
    app.get('/api/v1/node/:id/categoriesList', async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            const childrens = await node.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION);
            for (const child of childrens) {
                const info = {
                    dynamicId: child._server_id,
                    staticId: child.getId().get(),
                    name: child.getName().get(),
                    type: child.getType().get(),
                };
                nodes.push(info);
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(nodes);
    });
};
//# sourceMappingURL=categoriesList.js.map