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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const networkService_1 = __importDefault(require("../networkService"));
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/IoTNetworkContext/create:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Create a network context with its first network
     *     description: >-
     *       Creates a context of type `Network` holding one `NetworkVirtual` network, and adds the
     *       context to the profile graph so the caller can see it right away.
     *
     *
     *       Both names are taken as given : calling this twice with the same `contextName` reuses the
     *       existing context rather than failing. Unlike the device and endpoint create routes, this one
     *       waits for the write and returns the created nodes with their dynamic IDs.
     *     tags:
     *       - IoTNetwork & Time Series
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - contextName
     *               - networkName
     *             properties:
     *               contextName:
     *                 type: string
     *                 description: Name of the context to create. Its type is always `Network`.
     *               networkName:
     *                 type: string
     *                 description: Name of the first network. Its type is always `NetworkVirtual`.
     *     responses:
     *       200:
     *         description: The created context and network, each with its `dynamicId`.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 context:
     *                   type: object
     *                   description: The `info` of the context node, plus its `dynamicId`.
     *                 network:
     *                   type: object
     *                   description: The `info` of the network node, plus its `dynamicId`.
     *       400:
     *         description: The context or the network could not be created.
     *       401:
     *         description: The profile is not allowed to write on the graph.
     */
    app.post("/api/v1/IoTNetworkContext/create", async (req, res, next) => {
        try {
            const configService = {
                contextName: req.body.contextName,
                contextType: "Network",
                networkName: req.body.networkName,
                networkType: "NetworkVirtual"
            };
            const graph = await spinalAPIMiddleware.getGraph();
            const { contextId, networkId } = await (0, networkService_1.default)().init(graph, configService, true);
            const context = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(contextId);
            const network = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(networkId);
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            await userGraph.addContext(context);
            const result = {
                context: {
                    ...(context.info.get()),
                    dynamicId: context._server_id
                },
                network: {
                    ...(network.info.get()),
                    dynamicId: network._server_id
                }
            };
            res.status(200).json(result);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send();
        }
    });
};
//# sourceMappingURL=createIotNetwork.js.map