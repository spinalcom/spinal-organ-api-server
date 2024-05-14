"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeSeriesData = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinalTimeSeries_1 = require("../routes/IoTNetwork/spinalTimeSeries");
async function getTimeSeriesData(spinalAPIMiddleware, profileId, dynamicId, timeSeriesIntervalDate, includeLastBeforeStart = false) {
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    // @ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
    const datas = await (0, spinalTimeSeries_1.default)().getData(node.getId().get(), timeSeriesIntervalDate, includeLastBeforeStart);
    return datas;
}
exports.getTimeSeriesData = getTimeSeriesData;
exports.default = getTimeSeriesData;
//# sourceMappingURL=getTimeSeriesData.js.map