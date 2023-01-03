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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/ticket/{id}/event_list:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Returns events of ticket
     *     summary: Get list events of ticket
     *     tags:
     *       - Workflow & ticket
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
    app.post("/api/v1/ticket/:id/event_list", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            yield spinalAPIMiddleware.getGraph();
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            //ticket node
            var nodes = [];
            var node = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            if (((_a = node.getType()) === null || _a === void 0 ? void 0 : _a.get()) === "SpinalSystemServiceTicketTypeTicket") {
                if (req.body.period === "all") {
                    let listEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEvents((_b = node.getId()) === null || _b === void 0 ? void 0 : _b.get());
                    ListEvents(listEvents);
                }
                else if (req.body.period === "today") {
                    var start = new Date();
                    start.setHours(2, 0, 0, 0);
                    var end = new Date();
                    end.setHours(25, 59, 59, 999);
                    let listEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEvents((_c = node.getId()) === null || _c === void 0 ? void 0 : _c.get(), start, end);
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
                    let listEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEvents((_d = node.getId()) === null || _d === void 0 ? void 0 : _d.get(), firstday, lastday);
                    ListEvents(listEvents);
                }
                else if (req.body.period === "dateInterval") {
                    if (!(0, dateFunctions_1.verifDate)(req.body.startDate) || !(0, dateFunctions_1.verifDate)(req.body.endDate)) {
                        res.status(400).send("invalid Date");
                    }
                    else {
                        const start = (0, dateFunctions_1.sendDate)(req.body.startDate);
                        const end = (0, dateFunctions_1.sendDate)(req.body.endDate);
                        let listEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEvents((_e = node.getId()) === null || _e === void 0 ? void 0 : _e.get(), start.toDate(), end.toDate());
                        ListEvents(listEvents);
                    }
                }
            }
            else {
                res.status(400).send("the node is not of type Ticket");
            }
            function ListEvents(array) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                for (const child of array) {
                    // @ts-ignore
                    const _child = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode((_a = child.id) === null || _a === void 0 ? void 0 : _a.get());
                    if (((_b = _child.getType()) === null || _b === void 0 ? void 0 : _b.get()) === "SpinalEvent") {
                        let info = {
                            dynamicId: _child._server_id,
                            staticId: (_c = _child.getId()) === null || _c === void 0 ? void 0 : _c.get(),
                            name: (_d = _child.getName()) === null || _d === void 0 ? void 0 : _d.get(),
                            type: (_e = _child.getType()) === null || _e === void 0 ? void 0 : _e.get(),
                            groupeID: (_f = _child.info.groupId) === null || _f === void 0 ? void 0 : _f.get(),
                            categoryID: (_g = child.categoryId) === null || _g === void 0 ? void 0 : _g.get(),
                            nodeId: (_h = _child.info.nodeId) === null || _h === void 0 ? void 0 : _h.get(),
                            startDate: (_j = _child.info.startDate) === null || _j === void 0 ? void 0 : _j.get(),
                            endDate: (_k = _child.info.endDate) === null || _k === void 0 ? void 0 : _k.get(),
                            creationDate: (_l = _child.info.creationDate) === null || _l === void 0 ? void 0 : _l.get(),
                            user: {
                                username: (_m = _child.info.user.username) === null || _m === void 0 ? void 0 : _m.get(),
                                email: _child.info.user.email == undefined ? undefined : (_o = _child.info.user.email) === null || _o === void 0 ? void 0 : _o.get(),
                                gsm: _child.info.user.gsm == undefined ? undefined : (_p = _child.info.user.gsm) === null || _p === void 0 ? void 0 : _p.get()
                            }
                        };
                        nodes.push(info);
                    }
                }
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(nodes);
    }));
};
//# sourceMappingURL=ticketEventList.js.map