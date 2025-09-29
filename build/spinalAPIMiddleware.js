"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_organ_api_pubsub_1 = require("spinal-organ-api-pubsub");
// get the config
const config_1 = require("./config");
const spinalIOMiddleware_1 = require("./spinalIOMiddleware");
class SpinalAPIMiddleware {
    // singleton class
    static getInstance() {
        if (SpinalAPIMiddleware.instance === null) {
            SpinalAPIMiddleware.instance = new SpinalAPIMiddleware();
        }
        return SpinalAPIMiddleware.instance;
    }
    constructor() {
        this.loadedPtr = new Map();
        this.config = config_1.default;
        // connection string to connect to spinalhub
        const protocol = this.config.spinalConnector.protocol
            ? this.config.spinalConnector.protocol
            : 'http';
        const host = this.config.spinalConnector.host +
            (this.config.spinalConnector.port
                ? `:${this.config.spinalConnector.port}`
                : '');
        const login = `${this.config.spinalConnector.user}:${this.config.spinalConnector.password}`;
        const connect_opt = `${protocol}://${login}@${host}/`;
        console.log(`start connect to hub: ${protocol}://${host}/`);
        // initialize the connection
        this.conn = spinal_core_connectorjs_1.spinalCore.connect(connect_opt);
        // get the Model from the spinalhub, "onLoadSuccess" and "onLoadError" are 2
        // callback function.
        this.iteratorGraph = this.geneGraph();
    }
    async *geneGraph() {
        try {
            const graph = await spinal_core_connectorjs_1.spinalCore.load(this.conn, config_1.default.file.path);
            await spinal_env_viewer_graph_service_1.SpinalGraphService.setGraph(graph);
            while (true) {
                yield graph;
            }
        }
        catch (error) {
            console.error(`File does not exist in location ${config_1.default.file.path}`);
        }
    }
    // called if connected to the server and if the spinalhub sent us the Model
    async getGraph() {
        const g = await this.iteratorGraph.next();
        return g.value;
    }
    getProfileGraph() {
        return this.getGraph();
    }
    async load(server_id) {
        if (!server_id) {
            return Promise.reject('Invalid serverId');
        }
        if (typeof spinal_core_connectorjs_1.FileSystem._objects[server_id] !== 'undefined') {
            // @ts-ignore
            return Promise.resolve(spinal_core_connectorjs_1.FileSystem._objects[server_id]);
        }
        try {
            return await this.conn.load_ptr(server_id);
        }
        catch (error) {
            throw new Error(`Error loading model with server_id: ${server_id}`);
        }
    }
    async loadPtr(ptr) {
        if (!ptr)
            throw new Error('Invalid ptr');
        if (ptr instanceof spinal_core_connectorjs_1.File)
            return this.loadPtr(ptr._ptr);
        const server_id = ptr.data.value;
        if (!server_id)
            throw new Error('Invalid serverId');
        if (this.loadedPtr.has(server_id)) {
            return this.loadedPtr.get(server_id);
        }
        try {
            const model = await this.conn.load_ptr(server_id);
            this.loadedPtr.set(server_id, model);
            return model;
        }
        catch (error) {
            throw new Error(`Error loading model with server_id: ${server_id}`);
        }
    }
    async runSocketServer(server, spinalIOMiddleware) {
        await this._waitConnection();
        if (spinalIOMiddleware == undefined)
            spinalIOMiddleware = new spinalIOMiddleware_1.SpinalIOMiddleware(this.conn, this.config);
        const io = await (0, spinal_organ_api_pubsub_1.runSocketServer)(server, spinalIOMiddleware);
        return io;
    }
    async _waitConnection() {
        const timeout = 10000 + Date.now();
        while (timeout > Date.now()) {
            try {
                const graph = await this.getGraph();
                if (this.conn && graph) {
                    return;
                }
            }
            catch (error) {
                // do nothing, we will retry
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        throw new Error('Connection timed out');
    }
}
SpinalAPIMiddleware.instance = null;
exports.default = SpinalAPIMiddleware;
//# sourceMappingURL=spinalAPIMiddleware.js.map