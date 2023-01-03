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
const networkService_1 = require("../networkService");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/device/create:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: create device
     *     summary: create device
     *     tags:
     *       - IoTNetwork & Time Series
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - configDevice
     *             properties:
     *                networkDynamicId:
     *                 type: number
     *                 description: optional
     *                name:
     *                 type: string
     *                type:
     *                 type: string
     *     responses:
     *       200:
     *         description: Create Successfully
     *       400:
     *         description: Bad request
     */
    app.post("/api/v1/device/create", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var network = yield spinalAPIMiddleware.load(parseInt(req.body.networkDynamicId), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(network);
            var contextId = yield network.getContextIds();
            var contextNetwork = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(contextId[0]);
            var obj = {
                name: req.body.name,
                type: req.body.type,
                children: [],
                nodeTypeName: 'BmsDevice'
            };
            let configService = {
                contextName: contextNetwork.getName().get(),
                contextType: "Network",
                networkName: network.getName().get(),
                networkType: "NetworkVirtual"
            };
            const graph = yield spinalAPIMiddleware.getProfileGraph(profileId);
            (0, networkService_1.default)().init(graph, configService, true);
            //@ts-ignore
            (0, networkService_1.default)().createNewBmsDevice(network.getId().get(), obj);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send();
        }
        res.json();
    }));
};
//# sourceMappingURL=createDevice.js.map