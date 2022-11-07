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
const spinal_env_viewer_task_service_1 = require("spinal-env-viewer-task-service");
const dateFunctions_1 = require("../../../utilities/dateFunctions");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/room/{id}/event_list:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Returns events of room
   *     summary: Get list events of room
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
   *        description: use the dynamic ID
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     requestBody:
   *       description: you have 3 choices to fill in the "period" field   (*all* => to retrieve the entire list of events,   *today* => to retrieve today's events,   *week* = > to retrieve the events of the current week,   *dateInterval* or *undefined* to retrieve a precise date by filling in the "startDate" and "endDate" fields)
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - period
   *             properties:
   *               startDate:
   *                 type: string
   *               endDate:
   *                 type: string
   *               period:
   *                 type: string
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/Event'
   *       400:
   *         description: Bad request
  */
    app.post("/api/v1/room/:id/event_list", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            var nodes = [];
            var room = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            if (room.getType().get() === "geographicRoom") {
                if (req.body.period === "all") {
                    let listEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEvents(room.getId().get());
                    ListEvents(listEvents);
                }
                else if (req.body.period === "today") {
                    var start = new Date();
                    start.setHours(2, 0, 0, 0);
                    var end = new Date();
                    end.setHours(25, 59, 59, 999);
                    let listEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEvents(room.getId().get(), start, end);
                    ListEvents(listEvents);
                }
                else if (req.body.period === undefined || req.body.period === "week") {
                    var curr = new Date; // get current date
                    var first = (curr.getDate() - curr.getDay()) + 1; // First day is the day of the month - the day of the week
                    var last = first + 6; // last day is the first day + 6
                    var firstday = new Date(curr.setDate(first));
                    firstday.setHours(2, 0, 0, 0).toString();
                    var lastday = new Date(curr.setDate(last));
                    lastday.setHours(25, 59, 59, 999).toString();
                    let listEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEvents(room.getId().get(), firstday, lastday);
                    ListEvents(listEvents);
                }
                else if (req.body.period === "dateInterval") {
                    if (!(0, dateFunctions_1.verifDate)(req.body.startDate) || !(0, dateFunctions_1.verifDate)(req.body.endDate)) {
                        res.status(400).send("invalid Date");
                    }
                    else {
                        const start = (0, dateFunctions_1.sendDate)(req.body.startDate);
                        const end = (0, dateFunctions_1.sendDate)(req.body.endDate);
                        let listEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEvents(room.getId().get(), start.toDate(), end.toDate());
                        ListEvents(listEvents);
                    }
                }
            }
            else {
                res.status(400).send("node is not of type geographic room");
            }
            function ListEvents(array) {
                for (const child of array) {
                    // @ts-ignore
                    const _child = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(child.id.get());
                    if (_child.getType().get() === "SpinalEvent") {
                        console.log(_child);
                        let info = {
                            dynamicId: _child._server_id,
                            staticId: _child.getId().get(),
                            name: _child.getName().get(),
                            type: _child.getType().get(),
                            groupeID: _child.info.groupId.get(),
                            categoryID: child.categoryId.get(),
                            nodeId: _child.info.nodeId.get(),
                            startDate: _child.info.startDate.get(),
                            endDate: _child.info.endDate.get(),
                            creationDate: _child.info.creationDate == undefined ? undefined : _child.info.creationDate,
                            user: {
                                username: _child.info.user.username.get(),
                                email: _child.info.user.email == undefined ? undefined : _child.info.user.email.get(),
                                gsm: _child.info.user.gsm == undefined ? undefined : _child.info.user.gsm.get()
                            }
                        };
                        nodes.push(info);
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send("ko");
        }
        res.json(nodes);
    }));
};
//# sourceMappingURL=roomEvent.js.map