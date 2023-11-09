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
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_organ_api_pubsub_1 = require("spinal-organ-api-pubsub");
const Q = require('q');
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
        this.iteratorGraph = this.geneGraph();
        this.config = config_1.default;
        this.loadedPtr = new Map();
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
        this.conn = spinal_core_connectorjs_type_1.spinalCore.connect(connect_opt);
        // get the Model from the spinalhub, "onLoadSuccess" and "onLoadError" are 2
        // callback function.
    }
    async *geneGraph() {
        const init = new Promise((resolve, reject) => {
            spinal_core_connectorjs_type_1.spinalCore.load(this.conn, config_1.default.file.path, (graph) => {
                spinal_env_viewer_graph_service_1.SpinalGraphService.setGraph(graph)
                    .then(() => {
                    resolve(graph);
                })
                    .catch((e) => {
                    console.error(e);
                    reject();
                });
            }, () => {
                console.error(`File does not exist in location ${config_1.default.file.path}`);
                reject();
            });
        });
        const graph = await init;
        while (true) {
            yield graph;
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
    load(server_id) {
        if (!server_id) {
            return Promise.reject('Invalid serverId');
        }
        if (typeof spinal_core_connectorjs_type_1.FileSystem._objects[server_id] !== 'undefined') {
            // @ts-ignore
            return Promise.resolve(spinal_core_connectorjs_type_1.FileSystem._objects[server_id]);
        }
        return new Promise((resolve, reject) => {
            this.conn.load_ptr(server_id, (model) => {
                if (!model) {
                    // on error
                    reject('loadptr failed...!');
                }
                else {
                    // on success
                    resolve(model);
                }
            });
        });
    }
    loadPtr(ptr) {
        if (ptr instanceof spinal_core_connectorjs_type_1.spinalCore._def['File'])
            return this.loadPtr(ptr._ptr);
        const server_id = ptr.data.value;
        if (this.loadedPtr.has(server_id)) {
            return this.loadedPtr.get(server_id);
        }
        const prom = new Promise((resolve, reject) => {
            try {
                this.conn.load_ptr(server_id, (model) => {
                    if (!model) {
                        reject(new Error(`LoadedPtr Error server_id: '${server_id}'`));
                    }
                    else {
                        resolve(model);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
        this.loadedPtr.set(server_id, prom);
        return prom;
    }
    runSocketServer(server, spinalIOMiddleware) {
        return this._waitConnection().then(async (result) => {
            if (spinalIOMiddleware == undefined)
                spinalIOMiddleware = new spinalIOMiddleware_1.SpinalIOMiddleware(this.conn, this.config);
            const io = await (0, spinal_organ_api_pubsub_1.runSocketServer)(server, spinalIOMiddleware);
            return io;
        });
    }
    _waitConnection() {
        const deferred = Q.defer();
        const _waitConnectionLoop = (defer) => {
            const graph = this.getGraph().then((g) => {
                if (!this.conn || !g) {
                    setTimeout(() => {
                        defer.resolve(_waitConnectionLoop(defer));
                    }, 200);
                }
                else {
                    defer.resolve();
                }
            });
            return defer.promise;
        };
        return _waitConnectionLoop(deferred);
    }
}
SpinalAPIMiddleware.instance = null;
exports.default = SpinalAPIMiddleware;
//# sourceMappingURL=spinalAPIMiddleware.js.map