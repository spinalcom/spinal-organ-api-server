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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const upstaeControlEndpoint_1 = require("./../../utilities/upstaeControlEndpoint");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/command/room/{id}/blind:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Set command blind value
     *     summary: Set command blind value
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
     *               - blindCurrentValue
     *             properties:
     *               blindCurrentValue:
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
    app.post('/api/v1/command/room/:id/blind', async (req, res, next) => {
        var info;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            var controlPoints = await room.getChildren('hasControlPoints');
            for (const controlPoint of controlPoints) {
                if (controlPoint.getName().get() === "Command") {
                    var bmsEndpointsChildControlPoint = await controlPoint.getChildren('hasBmsEndpoint');
                    for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                        if (bmsEndPoint.getName().get() === "COMMAND_BLIND") {
                            //@ts-ignore
                            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(bmsEndPoint);
                            const model = spinal_env_viewer_graph_service_1.SpinalGraphService.getInfo(bmsEndPoint.getId().get());
                            var element = await bmsEndPoint.element.load();
                            await (0, upstaeControlEndpoint_1.updateControlEndpointWithAnalytic)(model, req.body.blindCurrentValue, spinal_model_bmsnetwork_1.InputDataEndpointDataType.Real, spinal_model_bmsnetwork_1.InputDataEndpointType.Other);
                            // var element = await bmsEndPoint.element.load();
                            // element.currentValue.set(req.body.blindCurrentValue)
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
            res.status(400).send("one of node is not loaded");
        }
        res.send(info);
    });
};
//# sourceMappingURL=roomCommandBlindSetValue.js.map