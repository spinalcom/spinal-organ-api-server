/**
 * Header of a snapshot file, also returned by the route.
 *
 * @export
 * @interface ISnapshotMeta
 */
export interface ISnapshotMeta {
    /** format version of the file, bump it on any breaking change */
    version: number;
    /** ISO date of the moment the snapshot was taken */
    createdAt: string;
    /** path of the digital twin the organ is connected to */
    digitalTwinPath: string | null;
    /** number of entries held by `FileSystem._objects` when the snapshot ran */
    objectCount: number;
    /** number of those entries that are SpinalNode (what the file contains) */
    nodeCount: number;
}
/**
 * Content of a snapshot file : the header followed by the dynamic ids
 * (`_server_id`) of the nodes, which is all that is needed to load them back
 * through `spinalAPIMiddleware.load()`.
 *
 * @export
 * @interface ISnapshotFile
 */
export interface ISnapshotFile extends ISnapshotMeta {
    nodes: number[];
}
/**
 * What `writeNodeSnapshot` returns : the header of the file it just wrote,
 * plus where it wrote it and how long it took.
 *
 * @export
 * @interface ISnapshotResult
 */
export interface ISnapshotResult extends ISnapshotMeta {
    /** absolute path of the written file */
    file: string;
    /** time the snapshot took, in milliseconds */
    durationMs: number;
}
/**
 * Absolute path of the file the snapshot is written to. Overridable through
 * the SNAPSHOT_FILE environment variable (relative paths are resolved from the
 * working directory of the organ).
 *
 * @export
 * @return {*}  {string}
 */
export declare function getSnapshotFilePath(): string;
/**
 * Walks `FileSystem._objects` and writes the `_server_id` of every SpinalNode
 * it holds into the snapshot file. The file is meant to be replayed later on
 * to warm up the FileSystem cache, so it is written to a temporary file then
 * renamed : a reader never sees a half written snapshot.
 *
 * The walk is chunked and yields to the event loop between chunks to avoid
 * blocking the API server on a big digital twin.
 *
 * @export
 * @return {*}  {Promise<ISnapshotResult>}
 */
export declare function writeNodeSnapshot(): Promise<ISnapshotResult>;
