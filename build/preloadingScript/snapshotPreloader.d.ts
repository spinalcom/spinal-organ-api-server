import type { ISpinalAPIMiddleware } from '../interfaces/ISpinalAPIMiddleware';
import { type ISnapshotFile } from '../routes/snapshot/snapshotUtils';
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
/**
 * Where the detail of the failures is written, next to the snapshot file :
 * `snapshots/nodes.json` -> `snapshots/nodes.failures.json`.
 *
 * @export
 * @return {*}  {string}
 */
export declare function getFailuresFilePath(): string;
/**
 * The node snapshot, when there is a usable one : null when the file is
 * missing, or when it cannot be read (the reason is logged), so that a caller
 * can fall back to another preloading strategy.
 *
 * @export
 * @return {*}  {(Promise<ISnapshotFile | null>)}
 */
export declare function findNodeSnapshot(): Promise<ISnapshotFile | null>;
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
export declare function runSnapshotPreloader(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId?: string, snapshot?: ISnapshotFile): Promise<ISnapshotPreloadStats | null>;
