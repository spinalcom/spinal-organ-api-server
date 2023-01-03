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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/nomenclatureGroup/{contextId}/category/{categoryId}/group/{groupId}/update:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: update group nomenclature Group
   *     summary: update group nomenclature Group
   *     tags:
   *       - Nomenclature Group
   *     parameters:
   *      - in: path
   *        name: contextId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64.
   *      - in: path
   *        name: categoryId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: groupId
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - newNameGroup
   *               - newNameColor
   *             properties:
   *                newNameGroup:
   *                 type: string
   *                newNameColor:
   *                 type: string
   *     responses:
   *       200:
   *         description: Update Successfully
   *       400:
   *         description: Bad request
  */
    app.put("/api/v1/nomenclatureGroup/:contextId/category/:categoryId/group/:groupId/update", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var context = yield spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            var category = yield spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            var group = yield spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(group);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext && category.belongsToContext(context) && group.belongsToContext(context)) {
                if (context.getType().get() === "AttributeConfigurationGroupContext") {
                    var dataObject = {
                        name: req.body.newNameGroup,
                        color: req.body.newNameColor
                    };
                    var groupUpdated = yield spinal_env_viewer_plugin_group_manager_service_1.default.updateGroup(group.getId().get(), dataObject);
                    var info = {
                        dynamicId: groupUpdated._server_id,
                        staticId: groupUpdated.getId().get(),
                        name: groupUpdated.getName().get(),
                        type: groupUpdated.getType().get(),
                        color: groupUpdated.info.color.get()
                    };
                }
                else {
                    res.status(400).send("node is not type of AttributeConfigurationGroupContext ");
                }
            }
            else {
                res.status(400).send("category or group not found in context");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send("ko");
        }
        res.json(info);
    }));
};
//# sourceMappingURL=updateGroupNomenclature.js.map