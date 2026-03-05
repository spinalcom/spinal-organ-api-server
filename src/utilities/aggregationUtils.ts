
export function computeAggregation(
  datas: { date: number; value: number }[],
  operations: string[]
): Record<string, number | null> {
  const result: Record<string, number | null> = {};

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
    if (v < min) min = v;
    if (v > max) max = v;
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


export function computeTimeWeightedMean(
  datas: { date: number; value: number }[],
  start: number,
  end: number
): number | null {
  if (!datas || datas.length === 0 || start >= end) return null;

  const sorted = [...datas].sort((a, b) => a.date - b.date);
  let prevValue: number | null = null;
  let prevTime = start;
  let accum = 0;
  let duration = 0;

  for (const point of sorted) {
    if (point.date <= start) {
      prevValue = point.value;
      continue;
    }

    if (point.date > end) break;

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

  if (duration === 0) return null;
  return accum / duration;
}

//
export function toTimestamp(value: string | number | Date): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') return new Date(value).getTime();
  return value;
}

const VALID_OPS = ['sum', 'min', 'max', 'avg', 'twavg', 'time_weighted_avg'];


export function parseAggregationParam(aggregationParam: string | undefined): {
  normalizedOps: string[] | null;
  basicOps: string[];
  needsTwavg: boolean;
} {
  if (!aggregationParam) {
    return { normalizedOps: null, basicOps: [], needsTwavg: false };
  }

  let requestedOps: string[];

  if (aggregationParam.trim().toLowerCase() === 'all') {
    requestedOps = [...VALID_OPS];
  } else {
    requestedOps = aggregationParam
      .split(',')
      .map((op) => op.trim().toLowerCase())
      .filter((op) => VALID_OPS.includes(op));
  }

  const normalizedOps = requestedOps.map((op) =>
    op === 'time_weighted_avg' ? 'twavg' : op
  );
  const basicOps = [...new Set(normalizedOps)].filter(
    (op) => op === 'sum' || op === 'min' || op === 'max' || op === 'avg'
  );
  const needsTwavg = normalizedOps.includes('twavg');

  return {
    normalizedOps: normalizedOps.length > 0 ? normalizedOps : null,
    basicOps,
    needsTwavg,
  };
}

export { VALID_OPS };

// ── Bucketing support ──

export interface BucketResult {
  start: string;
  end: string;
  count: number;
  [key: string]: string | number | null;
}

/**
 * Parse the ?bucket query parameter and return the bucket size in milliseconds.
 * Supported formats: "1h", "1d", "1w", "1M" (case-insensitive).
 * Returns null if the parameter is absent or invalid.
 */
export function parseBucketParam(bucket: string | undefined): number | null {
  if (!bucket) return null;
  const match = bucket.trim().match(/^(\d+)([hdwM])$/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit.toLowerCase()) {
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    default: break;
  }
  // 'M' is case-sensitive (uppercase) to distinguish from minutes
  if (unit === 'M') return value * 30 * 24 * 60 * 60 * 1000; // ~30 days approximation
  return null;
}

/**
 * Split the interval [start, end] into sub-intervals of size `bucketMs`
 * and compute the time-weighted average for each bucket.
 *
 * The full sorted dataset is passed in so that `computeTimeWeightedMean`
 * can pick up the last known value before each bucket start.
 *
 * @deprecated Use computeBucketedAggregation instead.
 */
export function computeBucketedTimeWeightedMean(
  datas: { date: number; value: number }[],
  start: number,
  end: number,
  bucketMs: number
): BucketResult[] {
  return computeBucketedAggregation(datas, start, end, bucketMs, [], true);
}

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
export function computeBucketedAggregation(
  datas: { date: number; value: number }[],
  start: number,
  end: number,
  bucketMs: number,
  basicOps: string[] = [],
  needsTwavg: boolean = true
): BucketResult[] {
  const results: BucketResult[] = [];
  const sorted = [...datas].sort((a, b) => a.date - b.date);

  let bucketStart = start;

  while (bucketStart < end) {
    const bucketEnd = Math.min(bucketStart + bucketMs, end);

    // Points strictly inside this bucket (for basic aggregations)
    const bucketPoints = sorted.filter(p => p.date > bucketStart && p.date <= bucketEnd);

    const entry: BucketResult = {
      start: new Date(bucketStart).toISOString(),
      end: new Date(bucketEnd).toISOString(),
      count: bucketPoints.length,
    };

    // Basic aggregations (sum, min, max, avg)
    if (basicOps.length > 0) {
      const agg = computeAggregation(bucketPoints, basicOps);
      for (const op of basicOps) {
        entry[op] = agg[op] ?? null;
      }
    }

    // Time-weighted average (uses full sorted array for carry-forward)
    if (needsTwavg) {
      entry.twavg = computeTimeWeightedMean(sorted, bucketStart, bucketEnd);
    }

    results.push(entry);
    bucketStart = bucketEnd;
  }

  return results;
}
