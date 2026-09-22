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
exports.findNodeSnapshot = findNodeSnapshot;
exports.runSnapshotPreloader = runSnapshotPreloader;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const config_1 = __importDefault(require("../config"));
const snapshotUtils_1 = require("../routes/snapshot/snapshotUtils");
const requestActivity_1 = require("./requestActivity");
/** only one preloading run at a time */
let running = false;
const PROGRESS_INTERVAL = 10000;
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
        durationMs: 0,
    };
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
            for (const result of results) {
                if (result.status === 'rejected')
                    stats.failed += 1;
                else if (result.value)
                    stats.loaded += 1;
                else
                    stats.cached += 1;
            }
            visited += batch.length;
            if (batchDelay > 0)
                await sleep(batchDelay);
        }
    }
    finally {
        clearInterval(intervalId);
        stats.durationMs = Date.now() - startedAt;
    }
    console.log(`--- Snapshot Preloader done in ${stats.durationMs} ms : ${stats.loaded} loaded, ${stats.cached} already there, ${stats.failed} failed, out of ${stats.total} ---`);
    return stats;
}
//# sourceMappingURL=snapshotPreloader.js.map