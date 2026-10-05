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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/room/{id}/endpoint_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the BMS endpoints of a room
     *     description: >-
     *       Returns the BMS endpoints reachable from a room, with the last value known by the hub. The
     *       node must be of type `geographicRoom`.
     *
     *
     *       The generic `/api/v1/node/{id}/endpoint_list` covers any node type and accepts
     *       `includeDetails`; this room-specific route does not.
     *     tags:
     *       - Geographic Context
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the room.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The endpoints of the room (an empty array if there are none).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/EndPointRoom'
     *       400:
     *         description: >-
     *           The node is not a room ("node is not of type geographic room"), or its endpoints could
     *           not be read ("list of endpoints is not loaded").
     *       401:
     *         description: The profile is not allowed to read this room.
     */
    app.get('/api/v1/room/:id/endpoint_list', async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const room = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
            if (room.getType().get() === 'geographicRoom') {
                const endpoints = await room.getChildren([
                    'hasEndPoint',
                    spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName,
                ]);
                const endpointPromises = endpoints.map(async (endpoint) => {
                    const element = await endpoint.element.load();
                    const currentValue = element.currentValue.get();
                    const unit = element.unit.get();
                    return {
                        dynamicId: endpoint._server_id,
                        staticId: endpoint.getId().get(),
                        name: endpoint.getName().get(),
                        type: endpoint.getType().get(),
                        currentValue: currentValue,
                        unit: unit,
                    };
                });
                const resolvedEndpoints = await Promise.all(endpointPromises);
                nodes.push(...resolvedEndpoints);
            }
            else {
                res.status(400).send('node is not of type geographic room');
            }
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('list of endpoints is not loaded');
        }
        res.send(nodes);
    });
};
//# sourceMappingURL=roomEndPointList.js.map