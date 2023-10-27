import { SpinalContext, SpinalGraphService, SpinalNode } from 'spinal-env-viewer-graph-service'
import spinalServiceTimeSeries from '../routes/IoTNetwork/spinalTimeSeries'
import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import { verifDate } from "./dateFunctions";
import { TimeSeriesIntervalDate } from 'spinal-model-timeseries';


async function getTimeSeriesData(
    spinalAPIMiddleware: SpinalAPIMiddleware,
    dynamicId: number,
    timeSeriesIntervalDate: TimeSeriesIntervalDate
  ) {

      const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId);
      // @ts-ignore
      SpinalGraphService._addNode(node);
  
      const datas = await spinalServiceTimeSeries().getData(node.getId().get(), timeSeriesIntervalDate);
      return datas;

  }

  export { getTimeSeriesData };
  export default getTimeSeriesData;