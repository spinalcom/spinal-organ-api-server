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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/{id}/nodeTypeList:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the node types found in a context
     *     description: >-
     *       Browses the whole context and returns the distinct node types it contains (for example
     *       `geographicBuilding`, `geographicFloor`, `geographicRoom`). Use one of these types with
     *       `/api/v1/context/{id}/nodesOfType/{type}` to get the matching nodes.
     *     tags:
     *       - Contexts/ontologies
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the context.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The distinct node types present in the context.
     *         content:
     *           application/json:
     *             schema:
     *              $ref: "#/components/schemas/ContextNodeTypeList"
     *       400:
     *         description: The context could not be loaded ("context not found").
     *       401:
     *         description: The profile is not allowed to read this context.
     */
    app.get("/api/v1/context/:id/nodeTypeList", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const context = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            const SpinalContextId = context.getId().get();
            var type_list = await spinal_env_viewer_graph_service_1.SpinalGraphService.browseAndClassifyByTypeInContext(SpinalContextId, SpinalContextId);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("context not found");
        }
        res.json(type_list.types);
    });
};
//# sourceMappingURL=contextNodeTypeList.js.map