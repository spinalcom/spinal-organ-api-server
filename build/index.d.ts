declare function Requests(logger: any): {
    run: () => Promise<void>;
    getSwaggerDocs: () => Object;
};
export declare const server: Promise<void>;
export default Requests;
