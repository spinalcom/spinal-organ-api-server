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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/event/{eventId}/update:
  *   put:
  *     security:
  *       - OauthSecurity:
  *         - read
  *     description: update event
  *     summary: update event
  *     tags:
  *       - Calendar & Event
  *     parameters:
  *      - in: path
  *        name: eventId
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
  *               - contextId
  *               - name
  *               - repeat
  *               - startDate
  *               - endDate
  *             properties:
  *               contextId:
  *                 type: integer
  *               name:
  *                 type: string
  *               startDate:
  *                 type: string
  *               endDate:
  *                 type: string
  *               repeat:
  *                 type: boolean
  *     responses:
  *       200:
  *         description: Updated successfully
  *       400:
  *         description: Bad request
    */
    app.put("/api/v1/event/:eventId/update", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            var context = yield spinalAPIMiddleware.load(parseInt(req.body.contextId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            var event = yield spinalAPIMiddleware.load(parseInt(req.params.eventId, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(event);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext && event.belongsToContext(context)) {
                if (context.getType().get() === "SpinalEventGroupContext") {
                    let newEventInfo = {
                        nodeId: event.info.nodeId,
                        periodicity: {
                            count: 0,
                            period: 3
                        },
                        startDate: req.body.startDate,
                        endDate: req.body.endDate,
                        repeat: req.body.repeat,
                        name: req.body.name
                    };
                    yield spinal_env_viewer_task_service_1.SpinalEventService.updateEvent(event.getId().get(), newEventInfo);
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
//# sourceMappingURL=updateEvent.js.map