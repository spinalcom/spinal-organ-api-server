process.env.TZ = 'Europe/Paris'; // day and month boundaries follow local time; the cases below need a DST zone
import * as assert from 'assert';
import {
  aggregateBucketsFromReader,
  bucketEdges,
  computeBucketedAggregation,
  computeTimeWeightedMean,
} from '../src/utilities/aggregationUtils';

const HOUR = 3600 * 1000;
const local = (y: number, m: number, d: number, h = 0, min = 0, s = 0) => new Date(y, m - 1, d, h, min, s).getTime();

/** Pseudo-random series (seeded) with irregular gaps, bursts and points exactly on hour boundaries. */
function series(start: number, end: number, seed = 1): { date: number; value: number }[] {
  let x = seed;
  const rand = () => (x = (x * 16807) % 2147483647) / 2147483647;
  const points = [];
  for (let t = start; t < end; ) {
    points.push({ date: t, value: Math.round((rand() * 200 - 50) * 100) / 100 });
    const r = rand();
    t += r < 0.1 ? 1000 : r < 0.2 ? HOUR - (t % HOUR) : r < 0.25 ? 5 * HOUR : Math.floor(rand() * 20 * 60 * 1000) + 1;
  }
  return points;
}

/** Reference: every bucket recomputed from scratch, the slow obvious way. */
function bruteForce(points: { date: number; value: number }[], edges: number[]) {
  return edges.slice(1).map((end, i) => {
    const start = edges[i];
    const inside = points.filter((p) => p.date >= start && p.date < end).map((p) => p.value);
    if (!inside.length) return { count: 0, sum: null, min: null, max: null, avg: null, twavg: null };
    const sum = inside.reduce((a, b) => a + b, 0);
    return {
      count: inside.length, sum, min: Math.min(...inside), max: Math.max(...inside), avg: sum / inside.length,
      twavg: computeTimeWeightedMean(points, start, end), // unchanged function: same time-weighted mean as before
    };
  });
}

const close = (a: number | null, b: number | null) =>
  (a === null && b === null) || (a !== null && b !== null && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)));

describe('aggregationUtils buckets', () => {
  it('runs in the Europe/Paris time zone', () => {
    assert.strictEqual(new Date(2026, 6, 1).getTimezoneOffset(), -120, 'lancer les tests avec TZ=Europe/Paris');
  });

  for (const unit of ['15min', 'hour', 'day', 'week', 'month'] as const) {
    it(`${unit}: every bucket equals the brute-force computation`, () => {
      const start = local(2026, 2, 27, 13, 17), end = local(2026, 4, 3, 9, 41); // crosses the March DST change
      const points = series(start - 2 * HOUR, end + 2 * HOUR, unit.length);
      const edges = bucketEdges(start, end, unit);
      const got = computeBucketedAggregation(points, start, end, unit, ['sum', 'min', 'max', 'avg'], true);
      const want = bruteForce(points, edges);
      assert.strictEqual(got.length, want.length);
      got.forEach((g, i) => {
        assert.strictEqual(g.count, want[i].count, `count ${g.start}`);
        for (const op of ['sum', 'min', 'max', 'avg', 'twavg'] as const) {
          assert.ok(close(g[op] as number | null, want[i][op]), `${op} ${g.start}: ${g[op]} ≠ ${want[i][op]}`);
        }
      });
    });
  }

  it('a point exactly on a boundary belongs to the next bucket', () => {
    const start = local(2024, 8, 1), end = local(2024, 8, 1, 3);
    const points = [{ date: local(2024, 8, 1, 0), value: 78 }, { date: local(2024, 8, 1, 1), value: 74 }];
    const [h0, h1, h2] = computeBucketedAggregation(points, start, end, 'hour', ['sum'], false);
    assert.deepStrictEqual([h0.sum, h1.sum, h2.sum], [78, 74, null]);
  });

  it('days follow local midnight, 23 h and 25 h on DST days', () => {
    const spring = bucketEdges(local(2026, 3, 29), local(2026, 3, 30), 'day');
    const autumn = bucketEdges(local(2026, 10, 25), local(2026, 10, 26), 'day');
    assert.strictEqual((spring[1] - spring[0]) / HOUR, 23);
    assert.strictEqual((autumn[1] - autumn[0]) / HOUR, 25);
  });

  it('months start on the local 1st', () => {
    const edges = bucketEdges(local(2026, 1, 1), local(2027, 1, 1), 'month');
    assert.strictEqual(edges.length, 13);
    edges.forEach((e, i) => assert.strictEqual(new Date(e).getDate(), 1, `bord ${i}`));
    assert.strictEqual(new Date(edges[3]).getHours(), 0, 'avril à minuit local, pas en UTC');
  });

  it('streamed read gives the same buckets, and falls back when days come out of order', async () => {
    const start = local(2026, 9, 1), end = local(2026, 11, 1);
    const points = series(start, end, 7);
    const expected = computeBucketedAggregation(points, start, end, 'day', ['sum', 'min', 'max'], true);
    const reader = (list: typeof points) => async () => (async function* () { yield* list; })();
    const streamed = await aggregateBucketsFromReader(reader(points), start, end, 'day', ['sum', 'min', 'max'], true);
    assert.deepStrictEqual(streamed, expected);
    const half = Math.floor(points.length / 2);
    const shuffled = [...points.slice(half), ...points.slice(0, half)];
    const recovered = await aggregateBucketsFromReader(reader(shuffled), start, end, 'day', ['sum', 'min', 'max'], true);
    assert.deepStrictEqual(recovered, expected);
  });

  it('empty interval and no data', () => {
    assert.deepStrictEqual(computeBucketedAggregation([], 1000, 1000, 'hour'), []);
    const [only] = computeBucketedAggregation([], 0, HOUR, 'hour', ['max'], true);
    assert.deepStrictEqual([only.count, only.noData, only.max, only.twavg], [0, true, null, null]);
  });

  it('one year at one point per second: single pass, bounded memory', async () => {
    const start = local(2025, 1, 1), end = local(2026, 1, 1);
    async function* perSecond() { for (let t = start; t < end; t += 1000) yield { date: t, value: (t / 1000) % 3600 }; }
    const before = process.memoryUsage().heapUsed;
    const t0 = Date.now();
    const buckets = await aggregateBucketsFromReader(async () => perSecond(), start, end, 'hour', ['max', 'sum'], true);
    const ms = Date.now() - t0;
    assert.strictEqual(buckets.length, 8760);
    assert.strictEqual(buckets[0].count, 3600);
    assert.ok(process.memoryUsage().heapUsed - before < 200e6, 'mémoire bornée');
    console.log(`      31,5 M de points en ${ms} ms`);
  }).timeout(120000);
});
