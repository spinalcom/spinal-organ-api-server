import { ISpinalAPIMiddleware } from '../interfaces';
import { TimeSeriesIntervalDate } from 'spinal-model-timeseries';
declare function getTimeSeriesData(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number, timeSeriesIntervalDate: TimeSeriesIntervalDate, includeLastBeforeStart?: boolean): Promise<import("spinal-model-timeseries").SpinalDateValue[]>;
export { getTimeSeriesData };
export default getTimeSeriesData;
