declare function Requests(logger: any): {
    run: () => Promise<any>;
    getSwaggerDocs: () => Object;
};
export declare const server: Promise<any>;
export default Requests;
