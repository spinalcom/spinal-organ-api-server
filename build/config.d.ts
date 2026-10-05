declare const config: {
    spinalConnector: {
        protocol: string;
        user: string;
        password: string;
        host: string;
        port: string;
    };
    api: {
        port: string;
    };
    file: {
        path: string;
    };
    preload: {
        workHoursStart: number;
        workHoursEnd: number;
        idleDelay: number;
        batchSize: number;
        batchDelay: number;
    };
};
export default config;
