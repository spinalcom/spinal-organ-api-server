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
const upstaeControlEndpoint_1 = require("./../../utilities/upstaeControlEndpoint");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/command/room/{id}/light:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Set command light value
     *     summary: Set command light value
     *     tags:
     *      - Command
     *     parameters:
     *      - in: path
     *        name: id
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     requestBody:
     *       description: set current value, float attribute,
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - lightCurrentValue
     *             properties:
     *               lightCurrentValue:
     *                 type: number
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Command'
     *       400:
     *         description: Bad request
     */
    app.post('/api/v1/command/room/:id/light', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var info;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var room = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            var controlPoints = yield room.getChildren('hasControlPoints');
            for (const controlPoint of controlPoints) {
                if (controlPoint.getName().get() === "Command") {
                    var bmsEndpointsChildControlPoint = yield controlPoint.getChildren('hasBmsEndpoint');
                    for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                        if (bmsEndPoint.getName().get() === "COMMAND_LIGHT") {
                            //@ts-ignore
                            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(bmsEndPoint);
                            const model = spinal_env_viewer_graph_service_1.SpinalGraphService.getInfo(bmsEndPoint.getId().get());
                            var element = yield bmsEndPoint.element.load();
                            yield (0, upstaeControlEndpoint_1.updateControlEndpointWithAnalytic)(model, req.body.lightCurrentValue, spinal_model_bmsnetwork_1.InputDataEndpointDataType.Real, spinal_model_bmsnetwork_1.InputDataEndpointType.Other);
                            // var element = (await bmsEndPoint.element.load()).get();
                            // element.currentValue.set(req.body.lightCurrentValue)
                            info = {
                                dynamicId: room._server_id,
                                staticId: room.getId().get(),
                                name: room.getName().get(),
                                type: room.getType().get(),
                                currentValue: element.currentValue.get()
                            };
                        }
                    }
                }
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of room is not loaded");
        }
        res.send(info);
    }));
};
//# sourceMappingURL=roomCommandLightSetValue.js.map