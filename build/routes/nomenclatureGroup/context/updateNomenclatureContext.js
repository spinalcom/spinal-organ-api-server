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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_nomenclature_service_1 = require("spinal-env-viewer-plugin-nomenclature-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/nomenclatureGroup/{id}/update:
     *   put:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Rename a group context
     *     description: >-
     *       Renames a group context. Only the name changes - the categories, groups and the items they
     *       hold are untouched.
     *
     *
     *       A successful call answers **200 with an empty body**.
     *     tags:
     *       - Nomenclature Group
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Dynamic ID of the group context.
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
     *               - newContextName
     *             properties:
     *               newContextName:
     *                 type: string
     *     responses:
     *       200:
     *         description: The context was renamed. The body is empty.
     *       400:
     *         description: The context could not be loaded.
     *       401:
     *         description: The profile is not allowed to write on this context.
     */
    app.put("/api/v1/nomenclatureGroup/:id/update", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const groupContext = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(groupContext);
            if (groupContext.getType().get() === "AttributeConfigurationGroupContext") {
                const contextUpdated = await spinal_env_viewer_plugin_nomenclature_service_1.spinalNomenclatureService.updateContext(groupContext.getId().get(), req.body.newNomenclatureContextName);
                var info = {
                    dynamicId: contextUpdated._server_id,
                    staticId: contextUpdated.getId().get(),
                    name: contextUpdated.getName().get(),
                    type: contextUpdated.getType().get(),
                };
            }
            else {
                res.status(400).send("node is not type of AttributeConfigurationGroupContext ");
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
//# sourceMappingURL=updateNomenclatureContext.js.map