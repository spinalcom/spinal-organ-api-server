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
  * /api/v1/event/{eventId}/read:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: Return event
  *     summary: Get event
  *     tags:
  *      - Calendar & Event
  *     parameters:
  *      - in: path
  *        name: eventId
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
  *                $ref: '#/components/schemas/Event'
  *       400:
  *         description: Bad request
    */
    app.get("/api/v1/event/:eventId/read", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var event = yield spinalAPIMiddleware.load(parseInt(req.params.eventId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(event);
            if (event.getType().get() === "SpinalEvent") {
                var info = {
                    dynamicId: event._server_id,
                    staticId: event.getId().get(),
                    name: event.getName().get(),
                    type: event.getType().get(),
                    groupeId: event.info.groupId.get(),
                    categoryId: event.info.categoryId.get(),
                    nodeId: event.info.nodeId.get(),
                    repeat: event.info.repeat.get(),
                    description: event.info.description.get(),
                    startDate: event.info.startDate.get(),
                    endDate: event.info.endDate.get(),
                };
            }
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of event is not loaded");
        }
        res.send(info);
    }));
};
//# sourceMappingURL=readEvent.js.map