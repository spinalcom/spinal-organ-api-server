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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/Network/create:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: create Network
     *     summary: create Network
     *     tags:
     *       - IoTNetwork & Time Series
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - IoTNetworkContext_DynamicId
     *               - NetworkName
     *               - NetworkTypeName
     *             properties:
     *                IoTNetworkContext_DynamicId:
     *                 type: string
     *                NetworkName:
     *                 type: string
     *                NetworkTypeName:
     *                 type: string
     *     responses:
     *       200:
     *         description: Create Successfully
     *       400:
     *         description: Bad request
     */
    app.post("/api/v1/Network/create", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var context = await spinalAPIMiddleware.load(parseInt(req.body.IoTNetworkContext_DynamicId), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            let configService = {
                contextName: context.getName().get(),
                contextType: "IoTNetwork",
                networkName: req.body.NetworkName,
                networkType: req.body.NetworkTypeName
            };
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            (0, networkService_1.default)().init(graph, configService, true);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send();
        }
        res.json();
    });
};
//# sourceMappingURL=createBmsNetwork.js.map