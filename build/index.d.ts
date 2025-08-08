declare function Requests(logger: any): {
    run: () => Promise<import("socket.io").Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>>;
    getSwaggerDocs: () => Object;
};
export default Requests;
