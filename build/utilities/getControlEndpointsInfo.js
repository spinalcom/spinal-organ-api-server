"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
exports.getControlEndpointsInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_control_endpoint_service_1 = require("spinal-env-viewer-plugin-control-endpoint-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const corseChildrenAndParentNode_1 = require("./corseChildrenAndParentNode");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
async function getControlEndpointsInfo(spinalAPIMiddleware, profilId, dynamicId, includeDetails = false) {
    const node = await spinalAPIMiddleware.load(dynamicId, profilId);
    // @ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
    const profils = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(node.getId().get(), [
        spinal_env_viewer_plugin_control_endpoint_service_1.spinalControlPointService.ROOM_TO_CONTROL_GROUP,
    ]);
    const promises = profils.map(async (profile) => {
        const result = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(profile.id.get(), [
            spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName,
        ]);
        const endpoints = await result.map(async (endpoint) => {
            const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(endpoint.id.get());
            const childrens_list = (0, corseChildrenAndParentNode_1.childrensNode)(realNode);
            const hasTimeSeries = childrens_list.some((child) => child.name === 'hasTimeSeries');
            const element = await endpoint.element.load();
            const currentValue = element.currentValue?.get();
            const unit = element.unit?.get();
            const saveTimeSeries = element.saveTimeSeries?.get();
            let controlValue = undefined;
            let timeSeriesMaxDay = undefined;
            if (includeDetails) {
                const controlValueAttribute = await spinal_env_viewer_plugin_documentation_service_1.attributeService.findAttributesByLabel(realNode, 'controlValue');
                const maxDayAttribute = await spinal_env_viewer_plugin_documentation_service_1.attributeService.findAttributesByLabel(realNode, 'timeSeries maxDay');
                if (controlValueAttribute) {
                    controlValue = controlValueAttribute.value.get();
                }
                if (maxDayAttribute) {
                    timeSeriesMaxDay = maxDayAttribute.value.get();
                }
            }
            return {
                dynamicId: realNode._server_id,
                staticId: endpoint.id.get(),
                name: element.name.get(),
                type: element.type.get(),
                currentValue: currentValue,
                unit: unit,
                saveTimeSeries: saveTimeSeries,
                hasTimeSeries: hasTimeSeries,
                controlValue: controlValue,
                timeseriesRetentionDays: timeSeriesMaxDay,
                lastUpdate: realNode.info?.directModificationDate?.get(),
            };
        });
        return {
            dynamicId: dynamicId,
            profileName: profile.name.get(),
            endpoints: await Promise.all(endpoints),
        };
    });
    return await Promise.all(promises);
}
exports.getControlEndpointsInfo = getControlEndpointsInfo;
exports.default = getControlEndpointsInfo;
//# sourceMappingURL=getControlEndpointsInfo.js.map