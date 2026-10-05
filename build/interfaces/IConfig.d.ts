export interface IConfig {
    spinalConnector: {
        protocol: string;
        user: string;
        password: string;
        host: string;
        port: number | string;
    };
    api: {
        port: number | string;
    };
    file: {
        path: string;
    };
    preload: IPreloadConfig;
}
/**
 * How the organ preloads : which window of the day counts as work hours, and
 * how gently the snapshot loader works in the background.
 *
 * A host embedding the API server fills it in its own middleware config, which
 * is what the preloading actually reads.
 */
export interface IPreloadConfig {
    /** start of the work hours, in minutes since midnight */
    workHoursStart: number;
    /** end of the work hours, in minutes since midnight */
    workHoursEnd: number;
    /** ms without any request before the snapshot loader loads a batch */
    idleDelay: number;
    /** number of nodes the snapshot loader loads at once */
    batchSize: number;
    /** ms the snapshot loader waits between two batches */
    batchDelay: number;
}
