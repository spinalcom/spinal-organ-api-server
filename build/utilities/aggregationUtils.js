"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BucketAccumulator = exports.VALID_OPS = void 0;
exports.computeAggregation = computeAggregation;
exports.computeTimeWeightedMean = computeTimeWeightedMean;
exports.toTimestamp = toTimestamp;
exports.parseAggregationParam = parseAggregationParam;
exports.parseBucketParam = parseBucketParam;
exports.bucketEdges = bucketEdges;
exports.computeBucketedAggregation = computeBucketedAggregation;
exports.computeBucketedTimeWeightedMean = computeBucketedTimeWeightedMean;
exports.aggregateBucketsFromReader = aggregateBucketsFromReader;
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
//
function toTimestamp(value) {
    if (value instanceof Date)
        return value.getTime();
    if (typeof value === 'string')
        return new Date(value).getTime();
    return value;
}
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
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
function parseBucketParam(bucket) {
    if (!bucket)
        return null;
    const unit = bucket.trim().toLowerCase();
    return ['15min', 'hour', 'day', 'week', 'month'].includes(unit) ? unit : null;
}
/** First bucket boundary strictly after `time`. */
function nextBoundary(time, unit) {
    // ponytail: hours and quarters are counted in UTC, which matches local boundaries for whole-hour time zones
    // (Europe/Paris); a half-hour time zone would need local arithmetic here.
    if (unit === '15min')
        return Math.floor(time / (15 * MINUTE_MS)) * 15 * MINUTE_MS + 15 * MINUTE_MS;
    if (unit === 'hour')
        return Math.floor(time / HOUR_MS) * HOUR_MS + HOUR_MS;
    const date = new Date(time);
    if (unit === 'month')
        return new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
    const daysToAdd = unit === 'week' ? 7 - ((date.getDay() + 6) % 7) : 1; // weeks start on Monday
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysToAdd).getTime();
}
/** Bucket boundaries from `start` to `end`: [start, b1, b2, …, end]. */
function bucketEdges(start, end, unit) {
    const edges = [start];
    for (let boundary = nextBoundary(start, unit); boundary < end; boundary = nextBoundary(boundary, unit)) {
        edges.push(boundary);
    }
    if (end > start)
        edges.push(end);
    return edges;
}
/**
 * Folds date-ordered points into buckets in a single pass.
 * Time-weighted mean: a value holds from its point until the next point (step function), like computeTimeWeightedMean;
 * a point dated before the first bucket (valueAtBegin) only provides the value held at the start.
 */
class BucketAccumulator {
    constructor(edges) {
        this.edges = edges;
        this.pointBucket = 0; // bucket of the last counted point
        this.holdBucket = 0; // bucket where the held value currently is
        this.held = null;
        this.totals = edges.slice(1).map(() => ({
            count: 0, sum: 0, min: Infinity, max: -Infinity, timeWeightedSum: 0, heldDuration: 0,
        }));
    }
    /** Adds a point; returns false if it is older than the previous one (the caller must sort and start over). */
    add(point) {
        if (this.held && point.date < this.held.date)
            return false;
        this.holdUntil(point.date);
        this.count(point);
        this.held = point;
        return true;
    }
    results(basicOps, needsTwavg) {
        this.holdUntil(this.edges[this.edges.length - 1]);
        return this.totals.map((t, i) => {
            const hasData = t.count > 0;
            const entry = {
                start: new Date(this.edges[i]).toISOString(),
                end: new Date(this.edges[i + 1]).toISOString(),
                count: t.count,
                noData: !hasData,
            };
            for (const op of basicOps) {
                if (!hasData)
                    entry[op] = null;
                else if (op === 'sum')
                    entry.sum = t.sum;
                else if (op === 'min')
                    entry.min = t.min;
                else if (op === 'max')
                    entry.max = t.max;
                else if (op === 'avg')
                    entry.avg = t.sum / t.count;
            }
            if (needsTwavg) {
                entry.twavg = hasData && t.heldDuration > 0 ? t.timeWeightedSum / t.heldDuration : null;
                entry.duration = hasData ? t.heldDuration : 0; // weight to combine twavg of several buckets
            }
            return entry;
        });
    }
    count(point) {
        const last = this.edges.length - 1;
        if (point.date < this.edges[0] || point.date >= this.edges[last])
            return;
        while (point.date >= this.edges[this.pointBucket + 1])
            this.pointBucket++;
        const t = this.totals[this.pointBucket];
        t.count++;
        t.sum += point.value;
        if (point.value < t.min)
            t.min = point.value;
        if (point.value > t.max)
            t.max = point.value;
    }
    /** Spreads the held value from its date up to `until` over the buckets it crosses. */
    holdUntil(until) {
        if (!this.held)
            return;
        const last = this.edges.length - 1;
        let from = Math.max(this.held.date, this.edges[0]);
        const to = Math.min(until, this.edges[last]);
        while (from < to) {
            while (from >= this.edges[this.holdBucket + 1])
                this.holdBucket++;
            const stop = Math.min(to, this.edges[this.holdBucket + 1]);
            this.totals[this.holdBucket].timeWeightedSum += this.held.value * (stop - from);
            this.totals[this.holdBucket].heldDuration += stop - from;
            from = stop;
        }
    }
}
exports.BucketAccumulator = BucketAccumulator;
/** Buckets for points already in memory (any order). */
function computeBucketedAggregation(datas, start, end, unit, basicOps = [], needsTwavg = true) {
    const accumulator = new BucketAccumulator(bucketEdges(start, end, unit));
    for (const point of [...datas].sort((a, b) => a.date - b.date))
        accumulator.add(point);
    return accumulator.results(basicOps, needsTwavg);
}
function computeBucketedTimeWeightedMean(datas, start, end, unit) {
    return computeBucketedAggregation(datas, start, end, unit, [], true);
}
/**
 * Buckets read straight from the archive, without loading the whole interval. `readPoints` opens a new read each
 * time it is called: if the archive returns days out of order (history inserted afterwards), the interval is read
 * again into memory and sorted.
 */
async function aggregateBucketsFromReader(readPoints, start, end, unit, basicOps = [], needsTwavg = true) {
    const accumulator = new BucketAccumulator(bucketEdges(start, end, unit));
    for await (const point of await readPoints()) {
        if (!accumulator.add(point)) {
            const all = [];
            for await (const p of await readPoints())
                all.push(p);
            return computeBucketedAggregation(all, start, end, unit, basicOps, needsTwavg);
        }
    }
    return accumulator.results(basicOps, needsTwavg);
}
//# sourceMappingURL=aggregationUtils.js.map