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
const spinal_env_viewer_task_service_1 = require("spinal-env-viewer-task-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/eventContext/{ContextId}/eventCategory/{CategoryId}/group_list:
     *   get:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Return list of event group
     *     summary: Gets a list of event group
     *     tags:
     *      - Calendar & Event
     *     parameters:
     *      - in: path
     *        name: ContextId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: CategoryId
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
     *                $ref: '#/components/schemas/GroupEvent'
     *       400:
     *         description: Bad request
     */
    app.get('/api/v1/eventContext/:ContextId/eventCategory/:CategoryId/group_list', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        let nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var context = yield spinalAPIMiddleware.load(parseInt(req.params.ContextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            var category = yield spinalAPIMiddleware.load(parseInt(req.params.CategoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext &&
                category.belongsToContext(context)) {
                if (context.getType().get() === 'SpinalEventGroupContext') {
                    var listGroupEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEventsGroups(category.getId().get());
                    for (const child of listGroupEvents) {
                        // @ts-ignore
                        const _child = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(child.id.get());
                        if (_child.getType().get() === 'SpinalEventGroup') {
                            let info = {
                                dynamicId: _child._server_id,
                                staticId: _child.getId().get(),
                                name: _child.getName().get(),
                                type: _child.getType().get(),
                            };
                            nodes.push(info);
                        }
                    }
                }
                else {
                    return res
                        .status(400)
                        .send('this context is not a SpinalEventGroupContext');
                }
            }
            else {
                res.status(400).send('node not found in context');
            }
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of category event is not loaded");
        }
        res.send(nodes);
    }));
};
//# sourceMappingURL=listEventGroup.js.map