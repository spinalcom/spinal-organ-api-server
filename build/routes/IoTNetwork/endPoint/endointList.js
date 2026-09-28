"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/device/{id}/endpoint_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the endpoints of a device
     *     description: >-
     *       Returns the `BmsEndpoint` children of a device, as `{ dynamicId, staticId, name, type }`.
     *
     *
     *       Values are not included here : read one endpoint with `/api/v1/endpoint/{id}/read`, several
     *       at once with `/api/v1/endpoint/read_multiple`, or use
     *       `/api/v1/node/{id}/endpoint_list` on the device to get the endpoints with their current
     *       values in a single call.
     *     tags:
     *      - IoTNetwork & Time Series
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the device.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The endpoints of the device (an empty array if there are none).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/IoTNetwork'
     *       400:
     *         description: The device could not be loaded ("list of endpoints is not loaded").
     *       401:
     *         description: The profile is not allowed to read this device.
     */
    app.get("/api/v1/device/:id/endpoint_list", async (req, res, next) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const device = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(device);
            const endpoints = await device.getChildren("hasBmsEndpoint");
            for (const endpoint of endpoints) {
                const info = {
                    dynamicId: endpoint._server_id,
                    staticId: endpoint.getId().get(),
                    name: endpoint.getName().get(),
                    type: endpoint.getType().get()
                };
                nodes.push(info);
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of endpoints is not loaded");
        }
        res.send(nodes);
    });
};
//# sourceMappingURL=endointList.js.map