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
    /** wall clock time of the run, idle waiting included */
    durationMs: number;
}
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
