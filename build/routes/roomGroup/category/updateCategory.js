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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/roomsGroup/{contextId}/category/{categoryId}/update:
   *   put:
   *     security:
   *       - OauthSecurity:
   *         - read
   *     description: update category roomsGroup
   *     summary: update category roomsGroup
   *     tags:
   *       - Rooms Group
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
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - newNameCategory
   *               - newNameIcon
   *             properties:
   *                newNameCategory:
   *                 type: string
   *                newNameIcon:
   *                 type: string
   *     responses:
   *       200:
   *         description: Update Successfully
   *       400:
   *         description: Bad request
  */
    app.put("/api/v1/roomsGroup/:contextId/category/:categoryId/update", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            var context = yield spinalAPIMiddleware.load(parseInt(req.params.contextId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            var category = yield spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext && category.belongsToContext(context)) {
                if (context.getType().get() === "geographicRoomGroupContext") {
                    var dataObject = {
                        name: req.body.newNameCategory,
                        icon: req.body.newNameIcon
                    };
                    spinal_env_viewer_plugin_group_manager_service_1.default.updateCategory(category.getId().get(), dataObject);
                }
                else {
                    res.status(400).send("node is not type of geographicRoomGroupContext ");
                }
            }
            else {
                res.status(400).send("category not found in context");
            }
        }
        catch (error) {
            console.error(error);
            res.status(400).send("ko");
        }
        res.json();
    }));
};
//# sourceMappingURL=updateCategory.js.map