"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateControlEndpointWithValue = exports.updateControlEndpointWithAnalytic = void 0;
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
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinalTimeSeries_1 = require("./spinalTimeSeries");
const spinal_env_viewer_plugin_control_endpoint_service_1 = require("spinal-env-viewer-plugin-control-endpoint-service");
/**
    * @param  {SpinalNode} node
    * @param  {any} valueToPush
    * @param  {any} dataType
    * @param  {any} type
    * @returns Promise
    */
async function updateControlEndpointWithAnalytic(node, valueToPush, dataType, type) {
    const networkService = new spinal_model_bmsnetwork_1.NetworkService();
    if (valueToPush != undefined) {
        const input = {
            id: "",
            name: "",
            path: "",
            currentValue: valueToPush,
            unit: "",
            dataType: dataType,
            type: type,
            nodeTypeName: "BmsEndpoint" // should be SpinalBmsEndpoint.nodeTypeName || 'BmsEndpoint'
        };
        const time = new Date(); //Register in TimeSeries
        await networkService.updateEndpoint(node, input, time);
    }
    else {
        console.log(valueToPush + " value to push in node : " + node.info.name.get() + " -- ABORTED !");
    }
}
exports.updateControlEndpointWithAnalytic = updateControlEndpointWithAnalytic;
/**
 * Update the endpoint with given value. More resilient and can handle string values.
 * This function was coded but not used yet as it was mentionned that the models changing would break all the  bindings on said models.
 */
async function updateControlEndpointWithValue(node, valueToPush, shouldReplaceDataType = false) {
    const spinalBmsEndpoint = await node.element.load();
    if (!spinalBmsEndpoint) {
        throw new Error(`Node ${node.info.name.get()} is not a valid BMS endpoint.`);
    }
    if (isDataTypeValid(valueToPush, spinalBmsEndpoint)) {
        // We can modify the endpoint value without changing the model type
        spinalBmsEndpoint.currentValue.set(valueToPush);
    }
    else if (shouldReplaceDataType) {
        // We need to change the model type to match the value type
        console.log('Changing data type for node:', node.info.name.get());
        spinalBmsEndpoint.mod_attr('currentValue', valueToPush);
        // Update the dataType based on the value type
        if (typeof valueToPush === 'string') {
            spinalBmsEndpoint.dataType.set(spinal_env_viewer_plugin_control_endpoint_service_1.ControlEndpointDataType.String);
            return; // for strings, business ends here
        }
        else if (typeof valueToPush === 'number') {
            spinalBmsEndpoint.dataType.set(spinal_env_viewer_plugin_control_endpoint_service_1.ControlEndpointDataType.Float);
        }
        else if (typeof valueToPush === 'boolean') {
            spinalBmsEndpoint.dataType.set(spinal_env_viewer_plugin_control_endpoint_service_1.ControlEndpointDataType.Boolean);
        }
    }
    if (spinalBmsEndpoint.saveTimeSeries?.get() === 1 && typeof valueToPush !== 'string') {
        const timeseries = await (0, spinalTimeSeries_1.default)().getOrCreateTimeSeries(node.getId().get());
        const finalValueToPush = typeof valueToPush === 'number' ? valueToPush : (valueToPush ? 1 : 0);
        await timeseries.push(finalValueToPush);
    }
}
exports.updateControlEndpointWithValue = updateControlEndpointWithValue;
/**
 * Checks if the value type is compatible with the endpoint value model type (Str, Val, Bool).
 */
function isDataTypeValid(value, spinalBmsEndpoint) {
    if (typeof value === 'string')
        return spinalBmsEndpoint.currentValue instanceof spinal_core_connectorjs_type_1.Str;
    if (typeof value === 'number') {
        return spinalBmsEndpoint.currentValue instanceof spinal_core_connectorjs_type_1.Val;
    }
    if (typeof value === 'boolean')
        return spinalBmsEndpoint.currentValue instanceof spinal_core_connectorjs_type_1.Bool;
}
//# sourceMappingURL=upstaeControlEndpoint.js.map