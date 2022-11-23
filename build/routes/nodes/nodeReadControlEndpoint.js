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
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/read_control_endpoint:
     *   post:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Get control endpoint value
     *     summary: Get control endpoint value
     *     tags:
     *      - Nodes
     *     requestBody:
     *       description: get current value, float attribute
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
     *                         type: string
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
    app.post('/api/v1/node/read_control_endpoint', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var arrayList = [];
            const nodetypes = ["geographicRoom", "BIMObject", "BIMObjectGroup", "geographicRoomGroup", "geographicFloor"];
            const controlPointTypes = ["COMMAND_BLIND", "COMMAND_LIGHT", "COMMAND_TEMP"];
            const nodes = req.body.propertyReference;
            for (const node of nodes) {
                const _node = yield spinalAPIMiddleware.load(parseInt(node.dynamicId, 10), profileId);
                if (nodetypes.includes(_node.getType().get())) {
                    for (const key of node.keys) {
                        if (controlPointTypes.includes(key)) {
                            let controlPoints = yield _node.getChildren('hasControlPoints');
                            for (const controlPoint of controlPoints) {
                                if (controlPoint.getName().get() === "Command") {
                                    let bmsEndpointsChildControlPoint = yield controlPoint.getChildren('hasBmsEndpoint');
                                    for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                                        if (bmsEndPoint.getName().get() === key) {
                                            let element = (yield bmsEndPoint.element.load()).get();
                                            let info = {
                                                dynamicId: _node._server_id,
                                                staticId: _node.getId().get(),
                                                name: _node.getName().get(),
                                                type: _node.getType().get(),
                                                currentValue: element.currentValue.get()
                                            };
                                            arrayList.push(info);
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
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send("list of room is not loaded");
        }
        res.send(arrayList);
    }));
};
//# sourceMappingURL=nodeReadControlEndpoint.js.map