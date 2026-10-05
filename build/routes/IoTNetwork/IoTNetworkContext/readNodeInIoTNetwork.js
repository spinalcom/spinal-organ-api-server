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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/IoTNetworkContext/{IoTNetworkId}/node/{nodeId}/read:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read a node of a network context
     *     description: >-
     *       Returns the summary of a node that is already registered in the graph service for the given
     *       network context, looked up **by its static ID**.
     *
     *
     *       It does not browse the context : a node that is not in the graph service cache yields a
     *       `null` body with a 200 status. Use
     *       `/api/v1/IoTNetworkContext/{IoTNetworkId}/node/{nodeId}/find` when the node may not be
     *       loaded yet.
     *     tags:
     *       - IoTNetwork & Time Series
     *     parameters:
     *      - in: path
     *        name: IoTNetworkId
     *        description: Dynamic ID of the network context.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: nodeId
     *        description: Static ID of the node to read.
     *        required: true
     *        schema:
     *          type: string
     *     responses:
     *       200:
     *         description: The node summary, or `null` when the node is not currently loaded.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/IoTNetwork'
     *       400:
     *         description: The context is not a network context ("this context is not a Network").
     *       401:
     *         description: The profile is not allowed to read this context.
     *       500:
     *         description: The context could not be loaded.
     */
    app.get("/api/v1/IoTNetworkContext/:IoTNetworkId/node/:nodeId/read", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const IoTNetwork = await spinalAPIMiddleware.load(parseInt(req.params.IoTNetworkId, 10), profileId);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.nodeId, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            if (IoTNetwork.getType().get() === "Network" && typeof node !== "undefined") {
                var info = {
                    dynamicId: node._server_id,
                    staticId: node.getId().get(),
                    name: node.getName().get(),
                    type: node.getType().get(),
                };
            }
            else if (IoTNetwork.getType().get() !== "Network") {
                return res.status(400).send("this context is not a Network");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(info);
    });
};
//# sourceMappingURL=readNodeInIoTNetwork.js.map