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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/command/room/{id}/temp:
     *   post:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Set command temp value
     *     summary: Set command temp value
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
     *       description: set current value, float attribute
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - tempCurrentValue
     *             properties:
     *               tempCurrentValue:
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
    app.post('/api/v1/command/room/:id/temp', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var info;
        try {
            var room = yield spinalAPIMiddleware.load(parseInt(req.params.id, 10));
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            var controlPoints = yield room.getChildren('hasControlPoints');
            for (const controlPoint of controlPoints) {
                if (controlPoint.getName().get() === "Command") {
                    var bmsEndpointsChildControlPoint = yield controlPoint.getChildren('hasBmsEndpoint');
                    for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                        if (bmsEndPoint.getName().get() === "COMMAND_TEMPERATURE") {
                            var element = yield bmsEndPoint.element.load();
                            yield (0, upstaeControlEndpoint_1.updateControlEndpointWithAnalytic)(bmsEndPoint, req.body.tempCurrentValue, spinal_model_bmsnetwork_1.InputDataEndpointDataType.Real, spinal_model_bmsnetwork_1.InputDataEndpointType.Other);
                            // element.currentValue.set(req.body.tempCurrentValue)
                            // info = {
                            //   dynamicId: room._server_id,
                            //   staticId: room.getId().get(),
                            //   name: room.getName().get(),
                            //   type: room.getType().get(),
                            //   currentValue: element.currentValue.get()
                            // }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
            res.status(400).send("list of room is not loaded");
        }
        res.send(info);
    }));
};
//# sourceMappingURL=roomCommandTempSetValue.js.map