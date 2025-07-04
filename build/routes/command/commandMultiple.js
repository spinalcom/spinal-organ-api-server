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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const upstaeControlEndpoint_1 = require("./../../utilities/upstaeControlEndpoint");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const findOneInContext_1 = require("../../utilities/findOneInContext");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/command:
     *   post:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Set command value
     *     summary: Set command value
     *     tags:
     *      - Command
     *     requestBody:
     *       description: set current value, float attribute
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               context:
     *                 type: string
     *               propertyReference:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     dynamicId:
     *                       type: string
     *                     staticId:
     *                       type: string
     *                     keys:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           key:
     *                             type: string
     *                           value:
     *                             type: string
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Command'
     *       400:
     *         description: Bad request
     */
    app.post('/api/v1/node/command', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const nodetypes = ["geographicRoom", "BIMObject", "BIMObjectGroup", "geographicRoomGroup", "geographicFloor"];
            const controlPointTypes = ["COMMAND_BLIND", "COMMAND_BLIND_ROTATION", "COMMAND_LIGHT", "COMMAND_TEMPERATURE"];
            const paramContext = req.body.context;
            const nodes = req.body.propertyReference;
            let context;
            let _node;
            for (const node of nodes) {
                if (isNumeric(node.dynamicId)) { // If dynamicId is not empty and looks like a number, load the node by dynamicId
                    _node = await spinalAPIMiddleware.load(parseInt(node.dynamicId, 10), profileId);
                }
                else if (node.staticId.length !== 0) { // If staticId is not empty, load the node by staticId
                    console.log("node.staticId", node.staticId);
                    if (paramContext === undefined) {
                        return res.status(400).send('Trying to load a node with staticId but no context provided');
                    }
                    if (typeof spinal_core_connectorjs_type_1.FileSystem._objects[paramContext] !== 'undefined') {
                        context = await spinalAPIMiddleware.load(parseInt(paramContext, 10), profileId);
                    }
                    else {
                        context = await loadContextByStaticId(paramContext);
                        if (!context) {
                            return res.status(400).send('Context not found');
                        }
                    }
                    _node = await loadNodeByStaticId(node.staticId, context);
                    if (!node) {
                        return res.status(400).send('Node could not be found');
                    }
                }
                if (!nodetypes.includes(_node.getType().get())) {
                    console.error(`Node with dynamicId ${node.dynamicId} is not of type authorized... Skipping it`);
                    continue;
                }
                for (const command of node.keys) {
                    if (!controlPointTypes.includes(command.key)) {
                        console.error(`Command key ${command.key} is not of type authorized... Skipping it`);
                        continue;
                    }
                    const controlPoints = await _node.getChildren('hasControlPoints');
                    for (const controlPoint of controlPoints) {
                        if (controlPoint.getName().get() === "Command") { // Name of cp profile 
                            const bmsEndpointsChildControlPoint = await controlPoint.getChildren('hasBmsEndpoint');
                            for (const bmsEndPoint of bmsEndpointsChildControlPoint) {
                                if (bmsEndPoint.getName().get() === command.key) {
                                    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(bmsEndPoint);
                                    await (0, upstaeControlEndpoint_1.updateControlEndpointWithAnalytic)(spinal_env_viewer_graph_service_1.SpinalGraphService.getInfo(bmsEndPoint.getId().get()), command.value, spinal_model_bmsnetwork_1.InputDataEndpointDataType.Real, spinal_model_bmsnetwork_1.InputDataEndpointType.Other);
                                    bmsEndPoint.info.directModificationDate.set(Date.now());
                                }
                            }
                        }
                    }
                }
            }
            res.status(200).send("Command updates executed successfully");
        }
        catch (error) {
            console.error(error);
            res.status(400).send("One of the nodes is not loaded");
        }
    });
};
async function loadContextByStaticId(contextStaticId) {
    if (spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(contextStaticId)) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(contextStaticId);
    }
    else if (spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(contextStaticId)) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(contextStaticId);
    }
    return undefined;
}
async function loadNodeByStaticId(nodeStaticId, context) {
    let resultNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(nodeStaticId);
    console.log("context", context.getName().get());
    if (typeof resultNode === 'undefined') {
        resultNode = await (0, findOneInContext_1.findOneInContext)(context, context, (n) => n.getId().get() === nodeStaticId);
    }
    return resultNode;
}
function isNumeric(str) {
    return /^[0-9]+$/.test(str);
}
//# sourceMappingURL=commandMultiple.js.map