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
export type BucketUnit = '15min' | 'hour' | 'day' | 'week' | 'month';
export declare function parseBucketParam(bucket: string | undefined): BucketUnit | null;
/** Bucket boundaries from `start` to `end`: [start, b1, b2, …, end]. */
export declare function bucketEdges(start: number, end: number, unit: BucketUnit): number[];
/**
 * Folds date-ordered points into buckets in a single pass.
 * Time-weighted mean: a value holds from its point until the next point (step function), like computeTimeWeightedMean;
 * a point dated before the first bucket (valueAtBegin) only provides the value held at the start.
 */
export declare class BucketAccumulator {
    private readonly edges;
    private readonly totals;
    private pointBucket;
    private holdBucket;
    private held;
    constructor(edges: number[]);
    /** Adds a point; returns false if it is older than the previous one (the caller must sort and start over). */
    add(point: {
        date: number;
        value: number;
    }): boolean;
    results(basicOps: string[], needsTwavg: boolean): BucketResult[];
    private count;
    /** Spreads the held value from its date up to `until` over the buckets it crosses. */
    private holdUntil;
}
/** Buckets for points already in memory (any order). */
export declare function computeBucketedAggregation(datas: {
    date: number;
    value: number;
}[], start: number, end: number, unit: BucketUnit, basicOps?: string[], needsTwavg?: boolean): BucketResult[];
export declare function computeBucketedTimeWeightedMean(datas: {
    date: number;
    value: number;
}[], start: number, end: number, unit: BucketUnit): BucketResult[];
/**
 * Buckets read straight from the archive, without loading the whole interval. `readPoints` opens a new read each
 * time it is called: if the archive returns days out of order (history inserted afterwards), the interval is read
 * again into memory and sorted.
 */
export declare function aggregateBucketsFromReader(readPoints: () => Promise<AsyncIterable<{
    date: number;
    value: number;
}>>, start: number, end: number, unit: BucketUnit, basicOps?: string[], needsTwavg?: boolean): Promise<BucketResult[]>;
