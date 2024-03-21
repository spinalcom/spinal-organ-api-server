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
const networkService_1 = require("../networkService");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/IoTNetworkContext/create:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: create network context
     *     summary: create network context
     *     tags:
     *       - IoTNetwork & Time Series
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - configNetworkContext
     *             properties:
     *                contextName:
     *                 type: string
     *                networkName:
     *                 type: string
     *     responses:
     *       200:
     *         description: Create Successfully
     *       400:
     *         description: Bad request
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