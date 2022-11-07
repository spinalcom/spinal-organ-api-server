"use strict";
/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
const upstaeControlEndpoint_1 = require("./../../utilities/upstaeControlEndpoint");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/command:
     *   post:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Set command value
     *     summary: Set command value
     *     tags:
     *      - Command
     *     requestBody:
     *       description: set current value, float attribute
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               propertyReference:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     dynamicId:
     *                       type: string
     *                     keys:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           key:
     *                             type: string
     *                           value:
     *                             type: string
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
    app.post('/api/v1/node/command', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            var arrayList = [];
            const nodetypes = ["geographicRoom", "BIMObject", "BIMObjectGroup", "geographicRoomGroup", "geographicFloor"];
            const controlPointTypes = ["COMMAND_BLIND", "COMMAND_LIGHT", "COMMAND_TEMP"];
            const nodes = req.body.propertyReference;
            for (const node of nodes) {
                const _node = yield spinalAPIMiddleware.load(parseInt(node.dynamicId, 10));
                if (nodetypes.includes(_node.getType().get())) {
                    for (const command of node.commands) {
                        if (controlPointTypes.includes(command.key)) {
                            let controlPoints = yield _node.getChildren('hasControlPoints');
                            for (const controlPoint of controlPoints) {
                                if (controlPoint.getName().get() === "Command") {
                                    let bmsEndpointsChildControlPoint = yield controlPoint.getChildren('hasBmsEndpoint');
                                    for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                                        if (bmsEndPoint.getName().get() === command.key) {
                                            yield (0, upstaeControlEndpoint_1.updateControlEndpointWithAnalytic)(bmsEndPoint, command.value, spinal_model_bmsnetwork_1.InputDataEndpointDataType.Real, spinal_model_bmsnetwork_1.InputDataEndpointType.Other);
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            res.status(400).send("unkown key");
                        }
                    }
                }
                else {
                    res.status(400).send("one of the node is not of type authorized");
                }
            }
        }
        catch (error) {
            console.error(error);
            res.status(400).send("one of node is not loaded");
        }
        res.send("Endpoint updated");
    }));
};
//# sourceMappingURL=commandMultiple.js.map