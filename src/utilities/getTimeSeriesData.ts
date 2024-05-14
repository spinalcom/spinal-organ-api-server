import { SpinalGraphService, SpinalNode } from 'spinal-env-viewer-graph-service'
import spinalServiceTimeSeries from '../routes/IoTNetwork/spinalTimeSeries'
import { ISpinalAPIMiddleware } from '../interfaces';
import { TimeSeriesIntervalDate } from 'spinal-model-timeseries';


async function getTimeSeriesData(
    spinalAPIMiddleware: ISpinalAPIMiddleware,
    profileId:string,
    dynamicId: number,
    timeSeriesIntervalDate: TimeSeriesIntervalDate,
    includeLastBeforeStart = false
  ) {

      const node: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
      // @ts-ignore
      SpinalGraphService._addNode(node);
  
      const datas = await spinalServiceTimeSeries().getData(node.getId().get(), timeSeriesIntervalDate,includeLastBeforeStart);
      return datas;

  }

  export { getTimeSeriesData };
  export default getTimeSeriesData;