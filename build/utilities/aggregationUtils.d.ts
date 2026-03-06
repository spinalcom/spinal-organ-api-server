export declare function computeAggregation(datas: {
    date: number;
    value: number;
}[], operations: string[]): Record<string, number | null>;
export declare function computeTimeWeightedMean(datas: {
    date: number;
    value: number;
}[], start: number, end: number): number | null;
export declare function toTimestamp(value: string | number | Date): number;
declare const VALID_OPS: string[];
export declare function parseAggregationParam(aggregationParam: string | undefined): {
    normalizedOps: string[] | null;
    basicOps: string[];
    needsTwavg: boolean;
};
export { VALID_OPS };
export interface BucketResult {
    start: string;
    end: string;
    count: number;
    noData: boolean;
    [key: string]: string | number | boolean | null | undefined;
}
/**
 * Parse the ?bucket query parameter and return the bucket size in milliseconds.
 * Supported formats: "hour", "day", "week", "month" (case-insensitive).
 * Returns null if the parameter is absent or invalid.
 */
export declare function parseBucketParam(bucket: string | undefined): number | null;
/**
 * Split the interval [start, end] into sub-intervals of size `bucketMs`
 * and compute the time-weighted average for each bucket.
 *
 * The full sorted dataset is passed in so that `computeTimeWeightedMean`
 * can pick up the last known value before each bucket start.
 *
 * @deprecated Use computeBucketedAggregation instead.
 */
export declare function computeBucketedTimeWeightedMean(datas: {
    date: number;
    value: number;
}[], start: number, end: number, bucketMs: number): BucketResult[];
/**
 * Split the interval [start, end] into sub-intervals of size `bucketMs`
 * and compute the requested aggregation operations for each bucket.
 *
 * @param datas       — full (unsorted) dataset
 * @param start       — interval start (ms epoch)
 * @param end         — interval end   (ms epoch)
 * @param bucketMs    — bucket width in milliseconds
 * @param basicOps    — array of basic operations: 'sum' | 'min' | 'max' | 'avg'
 * @param needsTwavg  — whether to compute the time-weighted average
 */
export declare function computeBucketedAggregation(datas: {
    date: number;
    value: number;
}[], start: number, end: number, bucketMs: number, basicOps?: string[], needsTwavg?: boolean): BucketResult[];
