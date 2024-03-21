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
     * /api/v1/node/{nodeId}/categoryByName/{categoryName}/update:
     *   put:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: update category attribut in specific node
     *     summary: update category attribut
     *     tags:
     *       - Node Attribut Categories
     *     parameters:
     *      - in: path
     *        name: nodeId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: categoryName
     *        required: true
     *        schema:
     *          type: string
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - categoryName
     *             properties:
     *               categoryName:
     *                 type: string
     *     responses:
     *       200:
     *         description: Updated successfully
     *       400:
     *         description: Bad request
     */
    app.put("/api/v1/node/:nodeId/categoryByName/:categoryName/update", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);
            const result = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation._categoryExist(node, req.params.categoryName);
            const newCatgoryName = req.body.categoryName;
            if (result === undefined) {
                res.status(400).send("category not found in node");
            }
            else {
                result.getName().set(newCatgoryName);
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
//# sourceMappingURL=updateCategoryByName.js.map