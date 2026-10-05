"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFailuresFilePath = getFailuresFilePath;
exports.findNodeSnapshot = findNodeSnapshot;
exports.runSnapshotPreloader = runSnapshotPreloader;
const fs_1 = require("fs");
const path_1 = require("path");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const config_1 = __importDefault(require("../config"));
const snapshotUtils_1 = require("../routes/snapshot/snapshotUtils");
const requestActivity_1 = require("./requestActivity");
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
function describeFailure(reason) {
    if (reason instanceof Error)
        return { message: reason.message };
    if (reason && typeof reason === 'object') {
        const message = typeof reason.message === 'string'
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
function getFailuresFilePath() {
    const filePath = (0, snapshotUtils_1.getSnapshotFilePath)();
    const ext = (0, path_1.extname)(filePath);
    return (0, path_1.join)((0, path_1.dirname)(filePath), `${(0, path_1.basename)(filePath, ext)}.failures${ext || '.json'}`);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Resolves once the API server has been quiet for `idleDelay` milliseconds :
 * no request in flight, and none served recently.
 *
 * @param {number} idleDelay
 * @return {*}  {Promise<void>}
 */
async function waitForIdle(idleDelay) {
    if (idleDelay <= 0)
        return;
    for (;;) {
        const idleFor = requestActivity_1.requestActivity.idleFor();
        if (requestActivity_1.requestActivity.pending === 0 && idleFor >= idleDelay)
            return;
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
async function loadNode(spinalAPIMiddleware, profileId, server_id) {
    if (typeof spinal_core_connectorjs_1.FileSystem._objects[server_id] !== 'undefined')
        return false;
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
async function findNodeSnapshot() {
    try {
        return await (0, snapshotUtils_1.readNodeSnapshot)();
    }
    catch (error) {
        console.warn(`[Snapshot Preloader] unusable snapshot file ${(0, snapshotUtils_1.getSnapshotFilePath)()} : ${error?.message ?? error}`);
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
async function runSnapshotPreloader(spinalAPIMiddleware, profileId = 'any', snapshot) {
    if (running) {
        console.warn('[Snapshot Preloader] already running, ignoring');
        return null;
    }
    // claimed before the first await, so that two concurrent calls cannot both
    // get past the check above
    running = true;
    try {
        return await preload(spinalAPIMiddleware, profileId, snapshot);
    }
    finally {
        running = false;
    }
}
async function preload(spinalAPIMiddleware, profileId, givenSnapshot) {
    const snapshot = givenSnapshot ?? (await (0, snapshotUtils_1.readNodeSnapshot)());
    if (!snapshot) {
        console.log(`[Snapshot Preloader] no snapshot file at ${(0, snapshotUtils_1.getSnapshotFilePath)()}, nothing to preload`);
        return null;
    }
    const startedAt = Date.now();
    // the host embedding the API server fills its own preload config ; fall back
    // to this organ's own config when it does not
    const { idleDelay, batchSize, batchDelay } = spinalAPIMiddleware.config?.preload ?? config_1.default.preload;
    const ids = snapshot.nodes;
    const stats = {
        total: ids.length,
        loaded: 0,
        cached: 0,
        failed: 0,
        failures: [],
        durationMs: 0,
    };
    // keyed by code + message, so that the 500 nodes a profile may not read are
    // reported as one line instead of 500
    const failureGroups = new Map();
    console.log(`--- Snapshot Preloader started at : ${new Date(startedAt).toLocaleString()}, ${ids.length} nodes from a snapshot taken on ${snapshot.createdAt} ---`);
    let visited = 0;
    const intervalId = setInterval(() => {
        console.log('[Snapshot Preloader] %d/%d visited -- %d loaded, %d already there, %d failed', visited, stats.total, stats.loaded, stats.cached, stats.failed);
    }, PROGRESS_INTERVAL);
    try {
        for (let i = 0; i < ids.length; i += batchSize) {
            await waitForIdle(idleDelay);
            const batch = ids.slice(i, i + batchSize);
            const results = await Promise.allSettled(batch.map((server_id) => loadNode(spinalAPIMiddleware, profileId, server_id)));
            results.forEach((result, index) => {
                if (result.status !== 'rejected') {
                    if (result.value)
                        stats.loaded += 1;
                    else
                        stats.cached += 1;
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
                }
                else {
                    group.truncated = true;
                }
            });
            visited += batch.length;
            if (batchDelay > 0)
                await sleep(batchDelay);
        }
    }
    finally {
        clearInterval(intervalId);
        stats.failures = Array.from(failureGroups.values()).sort((a, b) => b.count - a.count);
        stats.durationMs = Date.now() - startedAt;
    }
    console.log(`--- Snapshot Preloader done in ${stats.durationMs} ms : ${stats.loaded} loaded, ${stats.cached} already there, ${stats.failed} failed, out of ${stats.total} ---`);
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
async function reportFailures(stats, snapshot) {
    const filePath = getFailuresFilePath();
    if (stats.failed === 0) {
        // nothing failed : drop the report of a previous run if there is one
        await fs_1.promises.unlink(filePath).catch(() => undefined);
        return;
    }
    console.log('[Snapshot Preloader] %d failed, by reason :', stats.failed);
    for (const group of stats.failures) {
        const sample = group.server_ids.slice(0, LOGGED_FAILURE_IDS);
        const rest = group.count - sample.length;
        console.log('[Snapshot Preloader]   %s%s : %d nodes -- %s%s', group.code === undefined ? '' : `${group.code} `, group.message, group.count, sample.join(', '), rest > 0 ? ` (+${rest} more)` : '');
    }
    try {
        await fs_1.promises.mkdir((0, path_1.dirname)(filePath), { recursive: true });
        await fs_1.promises.writeFile(filePath, JSON.stringify({
            createdAt: new Date().toISOString(),
            snapshotCreatedAt: snapshot.createdAt,
            total: stats.total,
            loaded: stats.loaded,
            cached: stats.cached,
            failed: stats.failed,
            failures: stats.failures,
        }, null, 2) + '\n');
        console.log(`[Snapshot Preloader] the failing ids are listed in ${filePath}`);
    }
    catch (error) {
        console.warn(`[Snapshot Preloader] could not write ${filePath} : ${error?.message ?? error}`);
    }
}
//# sourceMappingURL=snapshotPreloader.js.map