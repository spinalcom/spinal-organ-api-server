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

import { Server } from 'http';
import {
  spinalCore,
  FileSystem,
  type Model,
  type Ptr,
  File,
  type Pbr,
} from 'spinal-core-connectorjs';
import type { SpinalGraph } from 'spinal-model-graph';
import type { IConfig } from 'src/interfaces';
import type { ISpinalAPIMiddleware } from './interfaces/ISpinalAPIMiddleware';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { runSocketServer } from 'spinal-organ-api-pubsub';

// get the config
import config from './config';
import { SpinalIOMiddleware } from './spinalIOMiddleware';
import { Server as SocketServer } from 'socket.io';

class SpinalAPIMiddleware implements ISpinalAPIMiddleware {
  static instance: SpinalAPIMiddleware = null;
  loadedPtr: Map<number, Model> = new Map();
  conn: FileSystem;
  iteratorGraph: AsyncGenerator<SpinalGraph>;
  config: IConfig = config;

  // singleton class
  static getInstance() {
    if (SpinalAPIMiddleware.instance === null) {
      SpinalAPIMiddleware.instance = new SpinalAPIMiddleware();
    }
    return SpinalAPIMiddleware.instance;
  }

  constructor() {
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
    this.iteratorGraph = this.geneGraph();
  }

  private async *geneGraph(): AsyncGenerator<SpinalGraph> {
    try {
      const graph = await spinalCore.load<SpinalGraph>(
        this.conn,
        config.file.path
      );
      await SpinalGraphService.setGraph(graph);

      while (true) {
        yield graph;
      }
    } catch (error) {
      console.error(`File does not exist in location ${config.file.path}`);
    }
  }
  // called if connected to the server and if the spinalhub sent us the Model

  async getGraph(): Promise<SpinalGraph> {
    const g = await this.iteratorGraph.next();
    return g.value;
  }

  getProfileGraph(): Promise<SpinalGraph> {
    return this.getGraph();
  }

  async load<T extends Model>(server_id: number): Promise<T> {
    if (!server_id) {
      return Promise.reject('Invalid serverId');
    }
    if (typeof FileSystem._objects[server_id] !== 'undefined') {
      // @ts-ignore
      return Promise.resolve(FileSystem._objects[server_id]);
    }
    try {
      return await this.conn.load_ptr(server_id);
    } catch (error) {
      throw new Error(`Error loading model with server_id: ${server_id}`);
    }
  }

  async loadPtr<T extends Model>(ptr: File<T> | Ptr<T> | Pbr<T>): Promise<T> {
    if (!ptr) throw new Error('Invalid ptr');
    if (ptr instanceof File) return this.loadPtr(ptr._ptr);
    const server_id = ptr.data.value;
    if (!server_id) throw new Error('Invalid serverId');
    if (this.loadedPtr.has(server_id)) {
      return this.loadedPtr.get(server_id) as T;
    }
    try {
      const model = await this.conn.load_ptr<T>(server_id);
      this.loadedPtr.set(server_id, model);
      return model;
    } catch (error) {
      throw new Error(`Error loading model with server_id: ${server_id}`);
    }
  }

  async runSocketServer(
    server: Server,
    spinalIOMiddleware?: SpinalIOMiddleware
  ): Promise<SocketServer> {
    await this._waitConnection();
    if (spinalIOMiddleware == undefined)
      spinalIOMiddleware = new SpinalIOMiddleware(this.conn, this.config);
    const io = await runSocketServer(server, spinalIOMiddleware);
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
      } catch (error) {
        // do nothing, we will retry
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error('Connection timed out');
  }
}

export default SpinalAPIMiddleware;
