"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateControlEndpointWithAnalytic = void 0;
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
/**
    * @param  {SpinalNodeRef} model
    * @param  {any} valueToPush
    * @param  {any} dataType
    * @param  {any} type
    * @returns Promise
    */
async function updateControlEndpointWithAnalytic(model, valueToPush, dataType, type) {
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
        await networkService.updateEndpoint(model, input, time);
        console.log(model.name.get() + " ==>  is updated ");
    }
    else {
        console.log(valueToPush + " value to push in node : " + model.name.get() + " -- ABORTED !");
    }
}
exports.updateControlEndpointWithAnalytic = updateControlEndpointWithAnalytic;
//# sourceMappingURL=upstaeControlEndpoint.js.map