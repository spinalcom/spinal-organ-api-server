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
 * Parse the ?bucket query parameter and return the bucket size in milliseconds,
 * or 'month' for calendar-month bucketing.
 * Supported formats: "hour", "day", "week", "month" (case-insensitive).
 *
 * Returns null if the parameter is absent or invalid.
 *
 * Returns the bucket size in milliseconds if valid.
 */
export declare function parseBucketParam(bucket: string | undefined): number | 'month' | null;
/**
 * Generate calendar-month bucket boundaries between start and end.
 * Each full month runs from the 1st at 00:00 UTC to the 1st of the next month.
 * The first and last buckets may be partial if start/end are not on the 1st.
 */
export declare function generateMonthBuckets(start: number, end: number): {
    bucketStart: number;
    bucketEnd: number;
}[];
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
}[], start: number, end: number, bucketMs: number | 'month'): BucketResult[];
/**
 * Split the interval [start, end] into sub-intervals of size `bucketMs`
 * (or calendar months when bucketMs === 'month') and compute the requested
 * aggregation operations for each bucket.
 *
 * @param datas       — full (unsorted) dataset
 * @param start       — interval start (ms epoch)
 * @param end         — interval end   (ms epoch)
 * @param bucketMs    — bucket width in milliseconds, or 'month' for calendar months
 * @param basicOps    — array of basic operations: 'sum' | 'min' | 'max' | 'avg'
 * @param needsTwavg  — whether to compute the time-weighted average
 */
export declare function computeBucketedAggregation(datas: {
    date: number;
    value: number;
}[], start: number, end: number, bucketMs: number | 'month', basicOps?: string[], needsTwavg?: boolean): BucketResult[];
