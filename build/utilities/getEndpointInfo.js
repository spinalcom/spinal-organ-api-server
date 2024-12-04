"use strict";
/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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
exports.getEndpointsInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const BMS_ENDPOINT_RELATIONS = ["hasEndPoint", spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName, spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName, spinal_model_bmsnetwork_1.SpinalBmsEndpointGroup.relationName];
async function getEndpointsInfo(spinalAPIMiddleware, profilId, dynamicId) {
    const nodes = [];
    spinalAPIMiddleware.getGraph();
    const node = await spinalAPIMiddleware.load(dynamicId, profilId);
    // @ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
    const endpoints = await spinal_env_viewer_graph_service_1.SpinalGraphService.findNodesByType(node.getId().get(), BMS_ENDPOINT_RELATIONS, spinal_model_bmsnetwork_1.SpinalBmsEndpoint.nodeTypeName);
    for (const endpoint of endpoints) {
        const element = await endpoint.element.load();
        const currentValue = element.currentValue.get();
        const unit = element.unit?.get();
        let saveTimeSeries = element.saveTimeSeries?.get();
        if (!saveTimeSeries) {
            // look for it through documentation
            const allAttributes = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getAllAttributes(endpoint);
            saveTimeSeries = allAttributes.find((attr) => attr.label.get() === 'timeSeries maxDay') !== undefined;
        }
        const info = {
            dynamicId: endpoint._server_id,
            staticId: endpoint.getId().get(),
            name: endpoint.getName().get(),
            type: endpoint.getType().get(),
            currentValue: currentValue,
            unit: unit,
            saveTimeSeries: saveTimeSeries
        };
        nodes.push(info);
    }
    return nodes;
}
exports.getEndpointsInfo = getEndpointsInfo;
exports.default = getEndpointsInfo;
//# sourceMappingURL=getEndpointInfo.js.map