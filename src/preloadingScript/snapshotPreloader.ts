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
  /** wall clock time of the run, idle waiting included */
  durationMs: number;
}

/** only one preloading run at a time */
let running = false;

const PROGRESS_INTERVAL = 10000;

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
    durationMs: 0,
  };

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
      for (const result of results) {
        if (result.status === 'rejected') stats.failed += 1;
        else if (result.value) stats.loaded += 1;
        else stats.cached += 1;
      }
      visited += batch.length;
      if (batchDelay > 0) await sleep(batchDelay);
    }
  } finally {
    clearInterval(intervalId);
    stats.durationMs = Date.now() - startedAt;
  }

  console.log(
    `--- Snapshot Preloader done in ${stats.durationMs} ms : ${stats.loaded} loaded, ${stats.cached} already there, ${stats.failed} failed, out of ${stats.total} ---`
  );
  return stats;
}
