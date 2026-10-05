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
const findOneInContext_1 = require("../../../utilities/findOneInContext");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/IoTNetworkContext/{IoTNetworkId}/node/{nodeId}/find:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Find a node inside a network context by its static ID
     *     description: >-
     *       Looks a node up **by its static ID** inside a network context and returns its summary,
     *       including the `dynamicId` needed by the other routes. This is the way to turn a persistent
     *       ID back into a usable dynamic ID after a hub restart.
     *
     *
     *       Unlike most routes, `nodeId` here is the static ID, not a dynamic one.
     *     tags:
     *       - IoTNetwork & Time Series
     *     parameters:
     *      - in: path
     *        name: IoTNetworkId
     *        description: Dynamic ID of the network context to search in.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: nodeId
     *        description: Static ID of the node to find.
     *        required: true
     *        schema:
     *          type: string
     *     responses:
     *       200:
     *         description: The node summary.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/IoTNetwork'
     *       400:
     *         description: The context is not a network context ("this context is not a Network").
     *       401:
     *         description: The profile is not allowed to read this context.
     *       404:
     *         description: No node with this static ID exists in the context ("node Not found").
     *       500:
     *         description: The context could not be loaded or browsed.
     */
    app.get("/api/v1/IoTNetworkContext/:IoTNetworkId/node/:nodeId/find", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const IoTNetwork = await spinalAPIMiddleware.load(parseInt(req.params.IoTNetworkId, 10), profileId);
            let node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(req.params.nodeId);
            if (IoTNetwork.getType().get() === "Network" && typeof node === "undefined") {
                node = await (0, findOneInContext_1.findOneInContext)(IoTNetwork, IoTNetwork, (n) => n.getId().get() === req.params.nodeId);
                if (typeof node === "undefined") {
                    return res.status(404).send("node Not found");
                }
                // @ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            }
            else if (IoTNetwork.getType().get() !== "Network") {
                return res.status(400).send("this context is not a Network");
            }
            var info = {
                dynamicId: node._server_id,
                staticId: node.getId().get(),
                name: node.getName().get(),
                type: node.getType().get(),
            };
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(info);
    });
};
//# sourceMappingURL=findNodeInIoTNetwork.js.map