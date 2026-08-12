declare function Requests(logger: any): {
    run: () => Promise<void>;
    getSwaggerDocs: () => Object;
};
export default Requests;
