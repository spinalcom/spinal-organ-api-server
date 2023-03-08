"use strict";
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
exports.updateControlEndpointWithAnalytic = void 0;
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
/**
    * @param  {SpinalNodeRef} model
    * @param  {any} valueToPush
    * @param  {any} dataType
    * @param  {any} type
    * @returns Promise
    */
function updateControlEndpointWithAnalytic(model, valueToPush, dataType, type) {
    return __awaiter(this, void 0, void 0, function* () {
        var networkService = new spinal_model_bmsnetwork_1.NetworkService();
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
            yield networkService.updateEndpoint(model, input, time);
            console.log(model.name.get() + " ==>  is updated ");
        }
        else {
            console.log(valueToPush + " value to push in node : " + model.name.get() + " -- ABORTED !");
        }
    });
}
exports.updateControlEndpointWithAnalytic = updateControlEndpointWithAnalytic;
//# sourceMappingURL=upstaeControlEndpoint.js.map