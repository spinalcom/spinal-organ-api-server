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
   * /api/v1/nomenclatureGroup/list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Return list of contexts
   *     summary: Gets a list of contexts nomenclature Group
   *     tags:
   *      - Nomenclature Group
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Context'
   *       400:
   *         description: Bad request
    */
    app.get("/api/v1/nomenclatureGroup/list", async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const groupContexts = await spinal_env_viewer_plugin_nomenclature_service_1.spinalNomenclatureService.getContexts(undefined, graph);
            for (let index = 0; index < groupContexts.length; index++) {
                const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(groupContexts[index].info.id.get());
                if (realNode.getType().get() === "AttributeConfigurationGroupContext" && realNode.getName().get() === "NomenclatureConfiguration") {
                    const info = {
                        dynamicId: realNode._server_id,
                        staticId: realNode.getId().get(),
                        name: realNode.getName().get(),
                        type: realNode.getType().get()
                    };
                    nodes.push(info);
                }
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of nomrncalture contexts is not loaded");
        }
        res.send(nodes);
    });
};
//# sourceMappingURL=listContextNomenclature.js.map