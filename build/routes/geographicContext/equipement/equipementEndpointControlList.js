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
const spinal_env_viewer_plugin_control_endpoint_service_1 = require("spinal-env-viewer-plugin-control-endpoint-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/equipement/{id}/control_endpoint_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the control endpoints of an equipment
     *     description: >-
     *       Returns the control points of a piece of equipment, grouped by control-point profile. The node
     *       must be of type `BIMObject`.
     *     tags:
     *       - Geographic Context
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the equipment (a `BIMObject`).
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The requested list (empty when there is nothing).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/EndPointRoom'
     *       400:
     *         description: The node is not a `BIMObject`, or its control points could not be read ("list of endpoints is not loaded").
     *       401:
     *         description: The profile is not allowed to read this equipment.
     */
    app.get("/api/v1/equipement/:id/control_endpoint_list", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const equipement = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(equipement);
            if (!(equipement.getType().get() === "BIMObject")) {
                res.status(400).send("node is not of type BIMObject");
            }
            const profils = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(equipement.getId().get(), [spinal_env_viewer_plugin_control_endpoint_service_1.spinalControlPointService.ROOM_TO_CONTROL_GROUP]);
            const promises = profils.map(async (profile) => {
                const result = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(profile.id.get(), [spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
                const endpoints = await result.map(async (endpoint) => {
                    const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(endpoint.id.get());
                    const element = await endpoint.element.load();
                    const currentValue = element.currentValue.get();
                    const unit = element.unit?.get();
                    const saveTimeSeries = element.saveTimeSeries?.get();
                    return {
                        dynamicId: realNode._server_id,
                        staticId: endpoint.id.get(),
                        name: element.name.get(),
                        type: element.type.get(),
                        currentValue: currentValue,
                        unit: unit,
                        saveTimeSeries: saveTimeSeries
                    };
                });
                return { profileName: profile.name.get(), endpoints: await Promise.all(endpoints) };
            });
            const allNodes = await Promise.all(promises);
            res.send(allNodes);
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of endpoints is not loaded");
        }
    });
};
//# sourceMappingURL=equipementEndpointControlList.js.map