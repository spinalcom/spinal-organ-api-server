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

import {Server} from 'http';
import {spinalCore, FileSystem} from 'spinal-core-connectorjs_type';
import {SpinalGraphService} from 'spinal-env-viewer-graph-service';
import {SpinalContext, SpinalGraph, SpinalNode} from 'spinal-model-graph';
import {runSocketServer} from 'spinal-organ-api-pubsub';
import {IConfig} from 'src/interfaces';
import {ISpinalAPIMiddleware} from './interfaces/ISpinalAPIMiddleware';
const Q = require('q');
// get the config
import config from './config';
import {SpinalIOMiddleware} from './spinalIOMiddleware';
import {Server as SocketServer} from 'socket.io';

class SpinalAPIMiddleware implements ISpinalAPIMiddleware {
  static instance: SpinalAPIMiddleware = null;
  loadedPtr: Map<number, any>;
  conn: spinal.FileSystem;
  iteratorGraph = this.geneGraph();
  config: IConfig = config;

  // singleton class
  static getInstance() {
    if (SpinalAPIMiddleware.instance === null) {
      SpinalAPIMiddleware.instance = new SpinalAPIMiddleware();
    }
    return SpinalAPIMiddleware.instance;
  }

  constructor() {
    this.loadedPtr = new Map();
    // connection string to connect to spinalhub
    const protocol = this.config.spinalConnector.protocol
      ? this.config.spinalConnector.protocol
      : 'http';
    const host =
      this.config.spinalConnector.host +
      (this.config.spinalConnector.port
        ? `:${this.config.spinalConnector.port}`
        : '');
    const login = `${this.config.spinalConnector.user}:${this.config.spinalConnector.password}`;
    const connect_opt = `${protocol}://${login}@${host}/`;

    console.log(`start connect to hub: ${protocol}://${host}/`);

    // initialize the connection
    this.conn = spinalCore.connect(connect_opt);
    // get the Model from the spinalhub, "onLoadSuccess" and "onLoadError" are 2
    // callback function.
  }

  private async *geneGraph(): AsyncGenerator<SpinalGraph<any>, never> {
    const init = new Promise<SpinalGraph<any>>((resolve, reject) => {
      spinalCore.load(
        this.conn,
        config.file.path,
        (graph: any) => {
          SpinalGraphService.setGraph(graph)
            .then(() => {
              resolve(graph);
            })
            .catch((e) => {
              console.error(e);
              reject();
            });
        },
        () => {
          console.error(`File does not exist in location ${config.file.path}`);
          reject();
        }
      );
    });

    const graph = await init;
    while (true) {
      yield graph;
    }
  }
  // called if connected to the server and if the spinalhub sent us the Model

  async getGraph(): Promise<SpinalGraph<any>> {
    const g = await this.iteratorGraph.next();
    return g.value;
  }

  getProfileGraph(): Promise<SpinalGraph> {
    return this.getGraph();
  }

  load<T extends spinal.Model>(server_id: number): Promise<T> {
    if (!server_id) {
      return Promise.reject('Invalid serverId');
    }
    if (typeof FileSystem._objects[server_id] !== 'undefined') {
      // @ts-ignore
      return Promise.resolve(FileSystem._objects[server_id]);
    }
    return new Promise((resolve, reject) => {
      this.conn.load_ptr(server_id, (model: T) => {
        if (!model) {
          // on error
          reject('loadptr failed...!');
        } else {
          // on success
          resolve(model);
        }
      });
    });
  }

  loadPtr<T extends spinal.Model>(
    ptr: spinal.File<T> | spinal.Ptr<T> | spinal.Pbr<T>
  ): Promise<T> {
    if (ptr instanceof spinalCore._def['File']) return this.loadPtr(ptr._ptr);
    const server_id = ptr.data.value;

    if (this.loadedPtr.has(server_id)) {
      return this.loadedPtr.get(server_id);
    }
    const prom: Promise<T> = new Promise((resolve, reject) => {
      try {
        this.conn.load_ptr(server_id, (model: T) => {
          if (!model) {
            reject(new Error(`LoadedPtr Error server_id: '${server_id}'`));
          } else {
            resolve(model);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
    this.loadedPtr.set(server_id, prom);
    return prom;
  }

  runSocketServer(
    server: Server,
    spinalIOMiddleware?: SpinalIOMiddleware
  ): Promise<SocketServer> {
    return this._waitConnection().then(async (result) => {
      if (spinalIOMiddleware == undefined)
        spinalIOMiddleware = new SpinalIOMiddleware(this.conn, this.config);
      const io = await runSocketServer(server, spinalIOMiddleware);
      return io;
    });
  }

  _waitConnection(): Promise<boolean> {
    const deferred = Q.defer();
    const _waitConnectionLoop = (defer) => {
      const graph = this.getGraph().then((g) => {
        if (!this.conn || !g) {
          setTimeout(() => {
            defer.resolve(_waitConnectionLoop(defer));
          }, 200);
        } else {
          defer.resolve();
        }
      });
      return defer.promise;
    };
    return _waitConnectionLoop(deferred);
  }
}

export default SpinalAPIMiddleware;
