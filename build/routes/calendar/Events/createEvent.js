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
const moment = require("moment");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/event/create:
  *   post:
  *     security:
  *       - OauthSecurity:
  *         - read
  *     description: create event
  *     summary: create event
  *     tags:
  *       - Calendar & Event
  *     requestBody:
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             required:
  *               - name
  *               - contextId
  *               - categoryDynamicId
  *               - groupDynamicId
  *               - nodeDynamicId
  *               - startDate
  *               - endDate
  *               - description
  *               - repeat
  *               - repeatEnd
  *               - count
  *               - period
  *             properties:
  *               name:
  *                 type: string
  *               contextId:
  *                 type: number
  *               categoryDynamicId:
  *                 type: number
  *               groupDynamicId:
  *                 type: number
  *               nodeDynamicId:
  *                 type: number
  *               startDate:
  *                 type: string
  *               endDate:
  *                 type: string
  *               description:
  *                 type: string
  *               repeat:
  *                 type: boolean
  *               repeatEnd:
  *                 type: number
  *               count:
  *                 type: number
  *               period:
  *                 type: number
  *     responses:
  *       200:
  *         description: Updated successfully
  *       400:
  *         description: Bad request
    */
    app.post("/api/v1/event/create", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            var context = yield spinalAPIMiddleware.load(parseInt(req.body.contextId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            var groupe = yield spinalAPIMiddleware.load(parseInt(req.body.groupDynamicId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(groupe);
            var node = yield spinalAPIMiddleware.load(parseInt(req.body.nodeDynamicId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            var category = yield spinalAPIMiddleware.load(parseInt(req.body.categoryDynamicId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext) {
                if (context.getType().get() === "SpinalEventGroupContext") {
                    let eventInfo = {
                        contextId: context.getId().get(),
                        groupId: groupe.getId().get(),
                        categoryId: category.getId().get(),
                        nodeId: node.getId().get(),
                        startDate: (moment(req.body.startDate, "DD MM YYYY HH:mm:ss", true)).toString(),
                        description: req.body.description,
                        endDate: (moment(req.body.endDate, "DD MM YYYY HH:mm:ss", true)).toString(),
                        periodicity: { count: req.body.count, period: req.body.period },
                        repeat: req.body.repeat,
                        name: req.body.name,
                        creationDate: (Date.now()).toString(),
                        repeatEnd: req.body.repeatEnd
                    };
                    let user = { username: "string", userId: 0 };
                    yield spinal_env_viewer_task_service_1.SpinalEventService.createEvent(context.getId().get(), groupe.getId().get(), node.getId().get(), eventInfo, user);
                }
                else {
                    return res.status(400).send("this context is not a SpinalEventGroupContext");
                }
            }
            else {
                res.status(400).send("node not found in context");
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send("ko");
        }
        res.json();
    }));
};
//# sourceMappingURL=createEvent.js.map