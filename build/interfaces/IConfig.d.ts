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
    preload: {
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
    };
}
