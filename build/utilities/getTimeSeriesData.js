"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeSeriesData = getTimeSeriesData;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinalTimeSeries_1 = __importDefault(require("../routes/IoTNetwork/spinalTimeSeries"));
async function getTimeSeriesData(spinalAPIMiddleware, profileId, dynamicId, timeSeriesIntervalDate, includeLastBeforeStart = false) {
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    // @ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
    const datas = await (0, spinalTimeSeries_1.default)().getData(node.getId().get(), timeSeriesIntervalDate, includeLastBeforeStart);
    return datas;
}
exports.default = getTimeSeriesData;
//# sourceMappingURL=getTimeSeriesData.js.map