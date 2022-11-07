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
const spinal_env_viewer_plugin_control_endpoint_service_1 = require("spinal-env-viewer-plugin-control-endpoint-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/node/{id}/control_endpoint_list:
  *   get:
  *     security:
  *       - OauthSecurity:
  *         - readOnly
  *     description: Return list of control endpoint
  *     summary: Gets a list of control endpoint
  *     tags:
  *      - Nodes
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
  *                $ref: '#/components/schemas/EndPointNode'
  *       400:
  *         description: Bad request
   */
    app.get("/api/v1/node/:id/control_endpoint_list", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            let room = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            var profils = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(room.getId().get(), [spinal_env_viewer_plugin_control_endpoint_service_1.spinalControlPointService.ROOM_TO_CONTROL_GROUP]);
            var promises = profils.map((profile) => __awaiter(this, void 0, void 0, function* () {
                // var result = await spinalControlPointService.getEndpointsNodeLinked(room.getId().get(), profile.id.get())
                var result = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(profile.id.get(), [spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
                var endpoints = yield result.map((endpoint) => __awaiter(this, void 0, void 0, function* () {
                    var realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(endpoint.id.get());
                    var element = yield endpoint.element.load();
                    var currentValue = element.currentValue.get();
                    return {
                        dynamicId: realNode._server_id,
                        staticId: endpoint.id.get(),
                        name: element.name.get(),
                        type: element.type.get(),
                        currentValue: currentValue
                    };
                }));
                return { profileName: profile.name.get(), endpoints: yield Promise.all(endpoints) };
            }));
            var allNodes = yield Promise.all(promises);
        }
        catch (error) {
            console.error(error);
            res.status(400).send("list of endpoints is not loaded");
        }
        res.send(allNodes);
    }));
};
//# sourceMappingURL=nodeControlEndPointList.js.map