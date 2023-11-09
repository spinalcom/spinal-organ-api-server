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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/equipementsGroup/{contextId}/category/{categoryId}/read:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: read category equipements Group
   *     summary: Get category equipements Group
   *     tags:
   *       - Equipements Group
   *     parameters:
   *      - in: path
   *        name: contextId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: categoryId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/BasicNode'
   *       400:
   *         description: Bad request
    */
    app.get("/api/v1/equipementsGroup/:contextId/category/:categoryId/read", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            var category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext && category.belongsToContext(context)) {
                if (context.getType().get() === "BIMObjectGroupContext") {
                    var info = {
                        dynamicId: category._server_id,
                        staticId: category.getId().get(),
                        name: category.getName().get(),
                        type: category.getType().get()
                    };
                }
                else {
                    res.status(400).send("node is not type of BIMObjectGroupContext ");
                }
            }
            else {
                res.status(400).send("category not found in context");
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
//# sourceMappingURL=readCategory.js.map