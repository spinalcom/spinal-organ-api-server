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
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/read_control_endpoint:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read command control points on several nodes
     *     description: >-
     *       Reads the current value of the `Command` control points of a batch of nodes. For each entry,
     *       the route walks `hasControlPoints` -> the profile named `Command` -> `hasBmsEndpoint`, and
     *       keeps the endpoints whose name matches one of the requested `keys`.
     *
     *
     *       Both sides are restricted : a node must be a `geographicRoom`, `geographicFloor`,
     *       `geographicRoomGroup`, `BIMObject` or `BIMObjectGroup`, and every key must be one of
     *       `COMMAND_BLIND`, `COMMAND_LIGHT` or `COMMAND_TEMP`. Anything else makes the request fail with
     *       400.
     *
     *
     *       The `dynamicId` / `name` / `type` returned on each row are those of the **requested node**,
     *       not of the endpoint; only `currentValue` comes from the control point.
     *     tags:
     *      - Nodes
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - propertyReference
     *             properties:
     *               propertyReference:
     *                 type: array
     *                 items:
     *                   type: object
     *                   required:
     *                     - dynamicId
     *                     - keys
     *                   properties:
     *                     dynamicId:
     *                       type: string
     *                       description: Dynamic ID of the node to read (accepted as a string or a number).
     *                     keys:
     *                       type: array
     *                       description: Names of the command control points to read.
     *                       items:
     *                         type: string
     *                         enum: [COMMAND_BLIND, COMMAND_LIGHT, COMMAND_TEMP]
     *     responses:
     *       200:
     *         description: One row per node and matching command control point.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   dynamicId:
     *                     type: integer
     *                     format: int64
     *                   staticId:
     *                     type: string
     *                   name:
     *                     type: string
     *                   type:
     *                     type: string
     *                   currentValue:
     *                     description: Current value of the command control point.
     *       400:
     *         description: >-
     *           A node is not of an allowed type ("one of the node is not of type authorized"), a key is
     *           not a known command ("unkown key"), or a node could not be loaded.
     *       401:
     *         description: The profile is not allowed to read one of the nodes.
     */
    app.post('/api/v1/node/read_control_endpoint', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var arrayList = [];
            const nodetypes = ["geographicRoom", "BIMObject", "BIMObjectGroup", "geographicRoomGroup", "geographicFloor"];
            const controlPointTypes = ["COMMAND_BLIND", "COMMAND_LIGHT", "COMMAND_TEMP"];
            const nodes = req.body.propertyReference;
            for (const node of nodes) {
                const _node = await spinalAPIMiddleware.load(parseInt(node.dynamicId, 10), profileId);
                if (nodetypes.includes(_node.getType().get())) {
                    for (const key of node.keys) {
                        if (controlPointTypes.includes(key)) {
                            const controlPoints = await _node.getChildren('hasControlPoints');
                            for (const controlPoint of controlPoints) {
                                if (controlPoint.getName().get() === "Command") {
                                    const bmsEndpointsChildControlPoint = await controlPoint.getChildren('hasBmsEndpoint');
                                    for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                                        if (bmsEndPoint.getName().get() === key) {
                                            const element = (await bmsEndPoint.element.load()).get();
                                            const info = {
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
    });
};
//# sourceMappingURL=nodeReadControlEndpoint.js.map