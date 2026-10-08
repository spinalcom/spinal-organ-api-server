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
     * /api/v1/node/{nodeId}/categoryByName/{categoryName}/delete:
     *   delete:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Delete an attribute category of a node, by name
     *     description: >-
     *       Removes the category named `categoryName` from the graph, with every attribute it holds.
     *       When several categories share that name, the first one found is deleted.
     *
     *
     *       A successful call answers **200 with an empty body**.
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
     *        name: categoryName
     *        description: Name of the category to delete (exact match).
     *        required: true
     *        schema:
     *          type: string
     *     responses:
     *       200:
     *         description: The category was deleted. The body is empty.
     *       400:
     *         description: The node carries no category with this name ("category not found in node").
     *       401:
     *         description: The profile is not allowed to write on this node.
     *       500:
     *         description: The node could not be loaded.
     */
    app.delete("/api/v1/node/:nodeId/categoryByName/:categoryName/delete", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);
            const result = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation._categoryExist(node, req.params.categoryName);
            if (result === undefined) {
                res.status(400).send("category not found in node");
            }
            else {
                result.removeFromGraph();
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json();
    });
};
//# sourceMappingURL=deleteCategoryByName.js.map