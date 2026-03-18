"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBucketedAggregation = exports.computeBucketedTimeWeightedMean = exports.parseBucketParam = exports.VALID_OPS = exports.parseAggregationParam = exports.toTimestamp = exports.computeTimeWeightedMean = exports.computeAggregation = void 0;
// Utility functions for computing aggregations sum, min , max ,avg on time-series data.
function computeAggregation(datas, operations) {
    const result = {};
    if (!datas || datas.length === 0) {
        for (const op of operations) {
            result[op] = null;
        }
        result['count'] = 0;
        return result;
    }
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    for (const point of datas) {
        const v = point.value;
        sum += v;
        if (v < min)
            min = v;
        if (v > max)
            max = v;
    }
    for (const op of operations) {
        switch (op) {
            case 'sum':
                result.sum = sum;
                break;
            case 'min':
                result.min = min === Infinity ? null : min;
                break;
            case 'max':
                result.max = max === -Infinity ? null : max;
                break;
            case 'avg':
                result.avg = sum / datas.length;
                break;
        }
    }
    result['count'] = datas.length;
    return result;
}
exports.computeAggregation = computeAggregation;
function computeTimeWeightedMean(datas, start, end) {
    if (!datas || datas.length === 0 || start >= end)
        return null;
    const sorted = [...datas].sort((a, b) => a.date - b.date);
    let prevValue = null;
    let prevTime = start;
    let accum = 0;
    let duration = 0;
    for (const point of sorted) {
        if (point.date <= start) {
            prevValue = point.value;
            continue;
        }
        if (point.date > end)
            break;
        if (prevValue === null) {
            prevValue = point.value;
            prevTime = point.date;
            continue;
        }
        const dt = point.date - prevTime;
        if (dt > 0) {
            accum += prevValue * dt;
            duration += dt;
        }
        prevValue = point.value;
        prevTime = point.date;
    }
    if (prevValue !== null && prevTime < end) {
        const dt = end - prevTime;
        accum += prevValue * dt;
        duration += dt;
    }
    if (duration === 0)
        return null;
    return accum / duration;
}
exports.computeTimeWeightedMean = computeTimeWeightedMean;
//
function toTimestamp(value) {
    if (value instanceof Date)
        return value.getTime();
    if (typeof value === 'string')
        return new Date(value).getTime();
    return value;
}
exports.toTimestamp = toTimestamp;
const VALID_OPS = ['sum', 'min', 'max', 'avg', 'twavg', 'time_weighted_avg'];
exports.VALID_OPS = VALID_OPS;
function parseAggregationParam(aggregationParam) {
    if (!aggregationParam) {
        return { normalizedOps: null, basicOps: [], needsTwavg: false };
    }
    let requestedOps;
    if (aggregationParam.trim().toLowerCase() === 'all') {
        requestedOps = [...VALID_OPS];
    }
    else {
        requestedOps = aggregationParam
            .split(',')
            .map((op) => op.trim().toLowerCase())
            .filter((op) => VALID_OPS.includes(op)); // Filter out invalid ops
    }
    const normalizedOps = requestedOps.map((op) => // Normalize 'time_weighted_avg' to 'twavg'
     op === 'time_weighted_avg' ? 'twavg' : op);
    const basicOps = [...new Set(normalizedOps)].filter(// Remove duplicates and keep only basic ops
    (op) => op === 'sum' || op === 'min' || op === 'max' || op === 'avg');
    const needsTwavg = normalizedOps.includes('twavg'); // Check if 'twavg' is requested
    return {
        normalizedOps: normalizedOps.length > 0 ? normalizedOps : null,
        basicOps,
        needsTwavg,
    };
}
exports.parseAggregationParam = parseAggregationParam;
/**
 * Parse the ? bucket query parameter and return the bucket size in milliseconds.
 * Supported formats: "hour", "day", "week", "month" (case-insensitive).
 *
 * Returns null if the parameter is absent or invalid.
 *
 * Returns the bucket size in milliseconds if valid.
 */
function parseBucketParam(bucket) {
    if (!bucket)
        return null;
    const unit = bucket.trim().toLowerCase();
    switch (unit) {
        case 'hour': return 3600000; //60 * 60 * 1000;
        case 'day': return 86400000; //24 * 60 * 60 * 1000;
        case 'week': return 604800000; //7 * 24 * 60 * 60 * 1000;
        case 'month': return 2592000000; //30 * 24 * 60 * 60 * 1000  (30 days)
        default: return null;
    }
}
exports.parseBucketParam = parseBucketParam;
/**
 * Split the interval [start, end] into sub-intervals of size `bucketMs`
 * and compute the time-weighted average for each bucket.
 *
 * The full sorted dataset is passed in so that `computeTimeWeightedMean`
 * can pick up the last known value before each bucket start.
 *
 * @deprecated Use computeBucketedAggregation instead.
 */
function computeBucketedTimeWeightedMean(datas, start, end, bucketMs) {
    return computeBucketedAggregation(datas, start, end, bucketMs, [], true);
}
exports.computeBucketedTimeWeightedMean = computeBucketedTimeWeightedMean;
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
function computeBucketedAggregation(datas, start, end, bucketMs, basicOps = [], needsTwavg = true) {
    const results = [];
    const sorted = [...datas].sort((a, b) => a.date - b.date);
    let bucketStart = start;
    while (bucketStart < end) {
        const bucketEnd = Math.min(bucketStart + bucketMs, end);
        // Points strictly inside this bucket (for basic aggregations)
        const bucketPoints = sorted.filter(p => p.date > bucketStart && p.date <= bucketEnd);
        const hasData = bucketPoints.length > 0;
        const entry = {
            start: new Date(bucketStart).toISOString(),
            end: new Date(bucketEnd).toISOString(),
            count: bucketPoints.length,
            noData: !hasData,
        };
        // Basic aggregations (sum, min, max, avg) — null when no real data
        if (basicOps.length > 0) {
            if (hasData) {
                const agg = computeAggregation(bucketPoints, basicOps);
                for (const op of basicOps) {
                    entry[op] = agg[op] ?? null;
                }
            }
            else {
                for (const op of basicOps) {
                    entry[op] = null;
                }
            }
        }
        if (needsTwavg) {
            entry.twavg = hasData
                ? computeTimeWeightedMean(sorted, bucketStart, bucketEnd)
                : null;
        }
        results.push(entry);
        bucketStart = bucketEnd;
    }
    return results;
}
exports.computeBucketedAggregation = computeBucketedAggregation;
//# sourceMappingURL=aggregationUtils.js.map