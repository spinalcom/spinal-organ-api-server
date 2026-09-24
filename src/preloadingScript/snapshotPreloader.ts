/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import { promises as fs } from 'fs';
import { basename, dirname, extname, join } from 'path';
import { FileSystem } from 'spinal-core-connectorjs';
import config from '../config';
import type { ISpinalAPIMiddleware } from '../interfaces/ISpinalAPIMiddleware';
import {
  getSnapshotFilePath,
  readNodeSnapshot,
  type ISnapshotFile,
} from '../routes/snapshot/snapshotUtils';
import { requestActivity } from './requestActivity';

/**
 * Outcome of a snapshot preloading run.
 *
 * @export
 * @interface ISnapshotPreloadStats
 */
export interface ISnapshotPreloadStats {
  /** number of ids the snapshot held */
  total: number;
  /** ids that were loaded from the hub */
  loaded: number;
  /** ids that were already in the FileSystem, nothing to load */
  cached: number;
  /** ids that could not be loaded (deleted node, hub error, ...) */
  failed: number;
  /** what those failures were, grouped by the reason the load rejected with */
  failures: IPreloadFailureGroup[];
  /** wall clock time of the run, idle waiting included */
  durationMs: number;
}

/**
 * The ids that failed to load for one same reason. A node of the snapshot can
 * be gone from the hub since it was taken (404), or be outside the contexts
 * the profile is allowed to read (401), which is the usual reason a host that
 * checks rights on load reports many failures.
 *
 * @export
 * @interface IPreloadFailureGroup
 */
export interface IPreloadFailureGroup {
  /** the code the load rejected with, when it had one */
  code?: number | string;
  /** the message the load rejected with */
  message: string;
  /** how many ids failed with this reason */
  count: number;
  /** the ids that failed, capped so that a huge run stays bounded in memory */
  server_ids: number[];
  /** true when `server_ids` was capped and holds only the first ones */
  truncated: boolean;
}

/** only one preloading run at a time */
let running = false;

const PROGRESS_INTERVAL = 10000;

/** ids kept per failure reason, so that a huge run stays bounded in memory */
const MAX_FAILURE_IDS_PER_GROUP = 5000;

/** ids listed per failure reason in the summary log */
const LOGGED_FAILURE_IDS = 10;

/**
 * Describes what a load rejected with. Hosts reject with an `Error`, but also
 * with plain `{ code, message }` objects (bos-config does), so neither shape
 * can be assumed.
 *
 * @param {*} reason
 * @return {*}  {{ code?: number | string; message: string }}
 */
function describeFailure(reason: any): {
  code?: number | string;
  message: string;
} {
  if (reason instanceof Error) return { message: reason.message };
  if (reason && typeof reason === 'object') {
    const message =
      typeof reason.message === 'string'
        ? reason.message
        : JSON.stringify(reason);
    return { code: reason.code, message };
  }
  return { message: String(reason) };
}

/**
 * Where the detail of the failures is written, next to the snapshot file :
 * `snapshots/nodes.json` -> `snapshots/nodes.failures.json`.
 *
 * @export
 * @return {*}  {string}
 */
export function getFailuresFilePath(): string {
  const filePath = getSnapshotFilePath();
  const ext = extname(filePath);
  return join(
    dirname(filePath),
    `${basename(filePath, ext)}.failures${ext || '.json'}`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves once the API server has been quiet for `idleDelay` milliseconds :
 * no request in flight, and none served recently.
 *
 * @param {number} idleDelay
 * @return {*}  {Promise<void>}
 */
async function waitForIdle(idleDelay: number): Promise<void> {
  if (idleDelay <= 0) return;
  for (;;) {
    const idleFor = requestActivity.idleFor();
    if (requestActivity.pending === 0 && idleFor >= idleDelay) return;
    // idleFor is 0 while requests are in flight, so this waits a full delay
    // then re-checks ; it never busy loops
    await sleep(Math.max(idleDelay - idleFor, 20));
  }
}

/**
 * Loads one node, unless the FileSystem already holds it.
 *
 * @param {ISpinalAPIMiddleware} spinalAPIMiddleware
 * @param {string} profileId
 * @param {number} server_id
 * @return {*}  {Promise<boolean>} true when the node was actually loaded
 */
async function loadNode(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  server_id: number
): Promise<boolean> {
  if (typeof FileSystem._objects[server_id] !== 'undefined') return false;
  await spinalAPIMiddleware.load(server_id, profileId);
  return true;
}

/**
 * The node snapshot, when there is a usable one : null when the file is
 * missing, or when it cannot be read (the reason is logged), so that a caller
 * can fall back to another preloading strategy.
 *
 * @export
 * @return {*}  {(Promise<ISnapshotFile | null>)}
 */
export async function findNodeSnapshot(): Promise<ISnapshotFile | null> {
  try {
    return await readNodeSnapshot();
  } catch (error) {
    console.warn(
      `[Snapshot Preloader] unusable snapshot file ${getSnapshotFilePath()} : ${
        error?.message ?? error
      }`
    );
    return null;
  }
}

/**
 * Loads every node id of the snapshot file back into the FileSystem, a batch
 * at a time, waiting for the API server to be idle between batches. Nothing is
 * kept from the loaded nodes : they stay in `FileSystem._objects`, which is
 * what makes the requests that need them faster afterwards.
 *
 * Does nothing when no snapshot file is available.
 *
 * @export
 * @param {ISpinalAPIMiddleware} spinalAPIMiddleware
 * @param {string} [profileId='any']
 * @param {ISnapshotFile} [snapshot] an already read snapshot ; read from the
 * snapshot file when omitted
 * @return {*}  {(Promise<ISnapshotPreloadStats | null>)} null when there is no
 * snapshot to load, or when a run is already in progress
 */
export async function runSnapshotPreloader(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId = 'any',
  snapshot?: ISnapshotFile
): Promise<ISnapshotPreloadStats | null> {
  if (running) {
    console.warn('[Snapshot Preloader] already running, ignoring');
    return null;
  }
  // claimed before the first await, so that two concurrent calls cannot both
  // get past the check above
  running = true;
  try {
    return await preload(spinalAPIMiddleware, profileId, snapshot);
  } finally {
    running = false;
  }
}

async function preload(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  givenSnapshot?: ISnapshotFile
): Promise<ISnapshotPreloadStats | null> {
  const snapshot = givenSnapshot ?? (await readNodeSnapshot());
  if (!snapshot) {
    console.log(
      `[Snapshot Preloader] no snapshot file at ${getSnapshotFilePath()}, nothing to preload`
    );
    return null;
  }

  const startedAt = Date.now();
  // the host embedding the API server fills its own preload config ; fall back
  // to this organ's own config when it does not
  const { idleDelay, batchSize, batchDelay } =
    spinalAPIMiddleware.config?.preload ?? config.preload;
  const ids = snapshot.nodes;
  const stats: ISnapshotPreloadStats = {
    total: ids.length,
    loaded: 0,
    cached: 0,
    failed: 0,
    failures: [],
    durationMs: 0,
  };
  // keyed by code + message, so that the 500 nodes a profile may not read are
  // reported as one line instead of 500
  const failureGroups = new Map<string, IPreloadFailureGroup>();

  console.log(
    `--- Snapshot Preloader started at : ${new Date(
      startedAt
    ).toLocaleString()}, ${ids.length} nodes from a snapshot taken on ${
      snapshot.createdAt
    } ---`
  );

  let visited = 0;
  const intervalId = setInterval(() => {
    console.log(
      '[Snapshot Preloader] %d/%d visited -- %d loaded, %d already there, %d failed',
      visited,
      stats.total,
      stats.loaded,
      stats.cached,
      stats.failed
    );
  }, PROGRESS_INTERVAL);

  try {
    for (let i = 0; i < ids.length; i += batchSize) {
      await waitForIdle(idleDelay);
      const batch = ids.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((server_id) =>
          loadNode(spinalAPIMiddleware, profileId, server_id)
        )
      );
      results.forEach((result, index) => {
        if (result.status !== 'rejected') {
          if (result.value) stats.loaded += 1;
          else stats.cached += 1;
          return;
        }
        stats.failed += 1;
        // allSettled keeps the order of the batch, so the id is recoverable
        const server_id = batch[index];
        const { code, message } = describeFailure(result.reason);
        const key = `${code ?? ''}|${message}`;
        let group = failureGroups.get(key);
        if (!group) {
          group = { code, message, count: 0, server_ids: [], truncated: false };
          failureGroups.set(key, group);
        }
        group.count += 1;
        if (group.server_ids.length < MAX_FAILURE_IDS_PER_GROUP) {
          group.server_ids.push(server_id);
        } else {
          group.truncated = true;
        }
      });
      visited += batch.length;
      if (batchDelay > 0) await sleep(batchDelay);
    }
  } finally {
    clearInterval(intervalId);
    stats.failures = Array.from(failureGroups.values()).sort(
      (a, b) => b.count - a.count
    );
    stats.durationMs = Date.now() - startedAt;
  }

  console.log(
    `--- Snapshot Preloader done in ${stats.durationMs} ms : ${stats.loaded} loaded, ${stats.cached} already there, ${stats.failed} failed, out of ${stats.total} ---`
  );
  await reportFailures(stats, snapshot);
  return stats;
}

/**
 * Logs the failures grouped by reason, with a few ids each, and writes the
 * full detail next to the snapshot file. A stale report of a previous run is
 * removed when everything loaded, so the file always describes the last run.
 *
 * @param {ISnapshotPreloadStats} stats
 * @param {ISnapshotFile} snapshot
 * @return {*}  {Promise<void>}
 */
async function reportFailures(
  stats: ISnapshotPreloadStats,
  snapshot: ISnapshotFile
): Promise<void> {
  const filePath = getFailuresFilePath();
  if (stats.failed === 0) {
    // nothing failed : drop the report of a previous run if there is one
    await fs.unlink(filePath).catch(() => undefined);
    return;
  }

  console.log(
    '[Snapshot Preloader] %d failed, by reason :',
    stats.failed
  );
  for (const group of stats.failures) {
    const sample = group.server_ids.slice(0, LOGGED_FAILURE_IDS);
    const rest = group.count - sample.length;
    console.log(
      '[Snapshot Preloader]   %s%s : %d nodes -- %s%s',
      group.code === undefined ? '' : `${group.code} `,
      group.message,
      group.count,
      sample.join(', '),
      rest > 0 ? ` (+${rest} more)` : ''
    );
  }

  try {
    await fs.mkdir(dirname(filePath), { recursive: true });
    await fs.writeFile(
      filePath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          snapshotCreatedAt: snapshot.createdAt,
          total: stats.total,
          loaded: stats.loaded,
          cached: stats.cached,
          failed: stats.failed,
          failures: stats.failures,
        },
        null,
        2
      ) + '\n'
    );
    console.log(
      `[Snapshot Preloader] the failing ids are listed in ${filePath}`
    );
  } catch (error) {
    console.warn(
      `[Snapshot Preloader] could not write ${filePath} : ${
        error?.message ?? error
      }`
    );
  }
}
