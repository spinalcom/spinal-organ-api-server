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
exports.getSnapshotFilePath = getSnapshotFilePath;
exports.writeNodeSnapshot = writeNodeSnapshot;
exports.readNodeSnapshot = readNodeSnapshot;
const fs_1 = require("fs");
const path_1 = require("path");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_model_graph_1 = require("spinal-model-graph");
const config_1 = __importDefault(require("../../config"));
const SNAPSHOT_VERSION = 1;
/** number of ids written between two yields to the event loop */
const CHUNK_SIZE = 5000;
/** number of ids per line in the written file, only there to keep it readable */
const IDS_PER_LINE = 20;
/**
 * Absolute path of the file the snapshot is written to. Overridable through
 * the SNAPSHOT_FILE environment variable (relative paths are resolved from the
 * working directory of the organ).
 *
 * @export
 * @return {*}  {string}
 */
function getSnapshotFilePath() {
    const configured = process.env.SNAPSHOT_FILE || 'snapshots/nodes.json';
    return (0, path_1.isAbsolute)(configured) ? configured : (0, path_1.resolve)(process.cwd(), configured);
}
/**
 * Calls callback for every model loaded in the FileSystem, with its server id.
 *
 * From spinal-core-connectorjs 2.5.27, `FileSystem._objects` is a proxy over
 * the model table : `Object.keys` on it builds a string per model, which runs
 * the organ out of memory on a big digital twin (11M models), and V8 caps it
 * at 2^23 keys anyway. `FileSystem.forEachModel` walks the table directly.
 * Older connectors don't have it and hold a plain object, walked with
 * `Object.keys` as before.
 *
 * @param {ModelCallback} callback
 */
function forEachLoadedModel(callback) {
    const fileSystem = spinal_core_connectorjs_1.FileSystem;
    if (typeof fileSystem.forEachModel === 'function') {
        fileSystem.forEachModel(callback);
        return;
    }
    const objects = spinal_core_connectorjs_1.FileSystem._objects;
    for (const key of Object.keys(objects))
        callback(objects[key], Number(key));
}
/**
 * Walks the models loaded in the FileSystem and writes the `_server_id` of
 * every SpinalNode into the snapshot file. The file is meant to be replayed later on
 * to warm up the FileSystem cache, so it is written to a temporary file then
 * renamed : a reader never sees a half written snapshot.
 *
 * The walk is chunked and yields to the event loop between chunks to avoid
 * blocking the API server on a big digital twin.
 *
 * @export
 * @return {*}  {Promise<ISnapshotResult>}
 */
async function writeNodeSnapshot() {
    const startedAt = Date.now();
    const filePath = getSnapshotFilePath();
    const tmpPath = `${filePath}.tmp`;
    // Collect the ids in one synchronous walk : the FileSystem keeps loading
    // objects while we write the file.
    const serverIds = [];
    let objectCount = 0;
    forEachLoadedModel((model, serverId) => {
        objectCount += 1;
        if (model instanceof spinal_model_graph_1.SpinalNode)
            serverIds.push(serverId);
    });
    const meta = {
        version: SNAPSHOT_VERSION,
        createdAt: new Date(startedAt).toISOString(),
        digitalTwinPath: config_1.default.file.path ?? null,
        objectCount,
        nodeCount: serverIds.length,
    };
    await fs_1.promises.mkdir((0, path_1.dirname)(filePath), { recursive: true });
    const handle = await fs_1.promises.open(tmpPath, 'w');
    try {
        // the header is written without its closing brace so that the ids can be
        // streamed after it instead of being kept in memory
        const header = JSON.stringify(meta, null, 2).replace(/\}$/, '').trimEnd();
        await handle.write(`${header},\n  "nodes": [`);
        let parts = [];
        for (let i = 0; i < serverIds.length; i += 1) {
            const separator = i === 0 ? '' : ',';
            const lineBreak = i % IDS_PER_LINE === 0 ? '\n    ' : ' ';
            parts.push(`${separator}${lineBreak}${serverIds[i]}`);
            if (parts.length >= CHUNK_SIZE) {
                await handle.write(parts.join(''));
                parts = [];
                await new Promise((resolve) => setImmediate(resolve));
            }
        }
        if (parts.length > 0)
            await handle.write(parts.join(''));
        await handle.write(`${serverIds.length > 0 ? '\n  ' : ''}]\n}\n`);
    }
    finally {
        await handle.close();
    }
    await fs_1.promises.rename(tmpPath, filePath);
    return { ...meta, file: filePath, durationMs: Date.now() - startedAt };
}
/**
 * Reads the snapshot file back. Returns null when there is none, so that a
 * caller can simply skip its preloading.
 *
 * @export
 * @return {*}  {(Promise<ISnapshotFile | null>)}
 */
async function readNodeSnapshot() {
    const filePath = getSnapshotFilePath();
    let content;
    try {
        content = await fs_1.promises.readFile(filePath, 'utf8');
    }
    catch (error) {
        if (error?.code === 'ENOENT')
            return null;
        throw error;
    }
    const snapshot = JSON.parse(content);
    if (!Array.isArray(snapshot?.nodes)) {
        throw new Error(`Invalid snapshot file ${filePath} : no "nodes" array`);
    }
    return snapshot;
}
//# sourceMappingURL=snapshotUtils.js.map