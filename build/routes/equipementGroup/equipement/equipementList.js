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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/equipementsGroup/{contextId}/category/{categoryId}/group/{groupId}/equipementList:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: read equipements List
     *     summary: Get equipements List
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
     *      - in: path
     *        name: groupId
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
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: Bad request
     */
    app.get('/api/v1/equipementsGroup/:contextId/category/:categoryId/group/:groupId/equipementList', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var _equipementList = [];
            var context = yield spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            var category = yield spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            var group = yield spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(group);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext &&
                category.belongsToContext(context) &&
                group.belongsToContext(context)) {
                if (context.getType().get() === 'BIMObjectGroupContext') {
                    const equipementList = yield group.getChildren('groupHasBIMObject');
                    for (const equipement of equipementList) {
                        var info = {
                            dynamicId: equipement._server_id,
                            staticId: equipement.getId().get(),
                            name: equipement.getName().get(),
                            type: equipement.getType().get(),
                        };
                        _equipementList.push(info);
                    }
                }
                else {
                    res.status(400).send('node is not type of BIMObjectGroupContext ');
                }
            }
            else {
                res.status(400).send('category or group not found in context');
            }
            res.json(_equipementList);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('ko');
        }
    }));
};
//# sourceMappingURL=equipementList.js.map