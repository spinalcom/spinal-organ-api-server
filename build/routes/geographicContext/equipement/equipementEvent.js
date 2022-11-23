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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
   * @swagger
   * /api/v1/equipement/{id}/event_list:
   *   get:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Returns events of equipement
   *     summary: Get list events of equipement
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
    app.get("/api/v1/equipement/:id/event_list", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var nodes = [];
            var equipement = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(equipement);
            if (equipement.getType().get() === "BIMObject") {
                var listEvents = yield spinal_env_viewer_task_service_1.SpinalEventService.getEvents(equipement.getId().get());
                for (const child of listEvents) {
                    // @ts-ignore
                    const _child = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(child.id.get());
                    if (_child.getType().get() === "SpinalEvent") {
                        let info = {
                            dynamicId: _child._server_id,
                            staticId: (_a = _child.getId()) === null || _a === void 0 ? void 0 : _a.get(),
                            name: (_b = _child.getName()) === null || _b === void 0 ? void 0 : _b.get(),
                            type: (_c = _child.getType()) === null || _c === void 0 ? void 0 : _c.get(),
                            groupeID: (_d = _child.info.groupId) === null || _d === void 0 ? void 0 : _d.get(),
                            categoryID: (_e = child.categoryId) === null || _e === void 0 ? void 0 : _e.get(),
                            nodeId: (_f = _child.info.nodeId) === null || _f === void 0 ? void 0 : _f.get(),
                            repeat: (_g = _child.info.repeat) === null || _g === void 0 ? void 0 : _g.get(),
                            description: (_h = _child.info.description) === null || _h === void 0 ? void 0 : _h.get(),
                            startDate: (_j = _child.info.startDate) === null || _j === void 0 ? void 0 : _j.get(),
                            endDate: (_k = _child.info.endDate) === null || _k === void 0 ? void 0 : _k.get(),
                        };
                        nodes.push(info);
                    }
                }
            }
            else {
                res.status(400).send("node is not of type  BIMObject");
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
//# sourceMappingURL=equipementEvent.js.map