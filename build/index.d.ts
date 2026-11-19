declare function Requests(logger: any): {
    run: () => Promise<any>;
    getSwaggerDocs: () => Object;
};
export default Requests;
