import express from 'express';
import { expect } from 'chai';
import { FileSystem, Model } from 'spinal-core-connectorjs';
import {
  SpinalContext,
  SpinalGraph,
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-model-graph';
import {
  CONTEXT_TYPE,
  BUILDING_TYPE,
  BUILDING_RELATION,
  FLOOR_TYPE,
  FLOOR_RELATION,
  ROOM_TYPE,
  ROOM_RELATION,
  EQUIPMENT_TYPE,
  EQUIPMENT_RELATION,
} from 'spinal-env-viewer-context-geographic-service';
import type { ISpinalAPIMiddleware } from '../../../src/interfaces';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

const sync: typeof import('../../../src/utilities/awaitSync') =
  require('../../../src/utilities/awaitSync');
const routes = [
  'building/createBuilding', 'building/getBuilding',
  'floor/createFloor', 'floor/getFloor', 'floor/getFloorById',
  'room/createRoom', 'room/getRoom', 'room/getRoomById',
  'equipment/createEquipment', 'equipment/getEquipment', 'equipment/getEquipmentById',
].map((path) => require(`../../../src/routes/v2/geographicContext/${path}`));

export async function createSpatialFixture() {
  const originalSigServer = FileSystem._sig_server;
  const originalAwaitSync = sync.awaitSync;
  const originalGraph = SpinalGraphService.graph;
  const originalNodes = SpinalGraphService.nodes;
  const originalNodesInfo = SpinalGraphService.nodesInfo;
  SpinalGraphService.nodes = { ...originalNodes };
  SpinalGraphService.nodesInfo = { ...originalNodesInfo };
  FileSystem._sig_server = true;
  const objects = new Map<number, Model>();
  const previousObjects = new Map<number, Model | undefined>();
  let nextId = 970000;
  const register = (model: Model) => {
    if (model._server_id && objects.get(model._server_id) === model) return;
    const id = nextId++;
    previousObjects.set(id, FileSystem._objects[id]);
    model._server_id = id;
    objects.set(id, model);
    FileSystem._objects[id] = model;
  };
  // Simulate only hub ID assignment; graph, attributes and route logic stay real.
  sync.awaitSync = async (model: Model) => { register(model); };
  const node = (name: string, type: string) => {
    const result = new SpinalNode(name, type);
    register(result);
    return result;
  };
  const graph = new SpinalGraph();
  SpinalGraphService.graph = graph;
  const context = new SpinalContext('spatial', CONTEXT_TYPE);
  register(context);
  await graph.addContext(context);
  const building = node('Building', BUILDING_TYPE);
  const floor = node('Floor', FLOOR_TYPE);
  const room = node('Room', ROOM_TYPE);
  const equipment = node('Equipment', EQUIPMENT_TYPE);
  const link = async (parent: SpinalNode, child: SpinalNode, relation: string) => {
    await parent.addChildInContext(child, relation, SPINAL_RELATION_PTR_LST_TYPE, context);
  };
  await link(context, building, BUILDING_RELATION);
  await link(building, floor, FLOOR_RELATION);
  await link(floor, room, ROOM_RELATION);
  await link(room, equipment, EQUIPMENT_RELATION);
  const loads: number[] = [];
  let graphReads = 0;
  const middleware: ISpinalAPIMiddleware = {
    config: {
      spinalConnector: { protocol: 'http', user: '', password: '', host: 'localhost', port: 0 },
      api: { port: 0 },
      file: { path: '' },
      preload: { workHoursStart: 0, workHoursEnd: 0, idleDelay: 0, batchSize: 1, batchDelay: 0 },
    },
    get conn(): spinal.FileSystem { throw new Error('No hub connection in unit tests'); },
    loadedPtr: new Map(),
    async getGraph() { return graph; },
    async getProfileGraph(profileId) {
      expect(profileId).to.equal('v2-test-profile');
      graphReads++;
      return graph;
    },
    async load<T extends spinal.Model>(id: number, profileId?: string): Promise<T> {
      expect(profileId).to.equal('v2-test-profile');
      loads.push(id);
      const result = objects.get(id);
      if (!result) throw new Error(`Unknown dynamic ID: ${id}`);
      return result as T;
    },
    async loadPtr<T extends spinal.Model>(): Promise<T> {
      throw new Error('Unexpected pointer loading');
    },
  };
  const app = express();
  app.set('query parser', 'extended');
  app.use(express.json());
  app.use((req, _res, next) => {
    Object.assign(req, { profileId: 'v2-test-profile' });
    next();
  });
  for (const route of routes) route(null, app, middleware);
  return {
    app, graph, context, building, floor, room, equipment, node, link, register,
    middleware, loads, profileId: 'v2-test-profile',
    get graphReads() { return graphReads; },
    async removeBuilding() {
      await context.removeChild(building, BUILDING_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
    },
    cleanup() {
      sync.awaitSync = originalAwaitSync;
      SpinalGraphService.graph = originalGraph;
      SpinalGraphService.nodes = originalNodes;
      SpinalGraphService.nodesInfo = originalNodesInfo;
      FileSystem._sig_server = originalSigServer;
      for (const [id, previous] of previousObjects) {
        if (previous === undefined) delete FileSystem._objects[id];
        else FileSystem._objects[id] = previous;
      }
    },
  };
}

export type SpatialFixture = Awaited<ReturnType<typeof createSpatialFixture>>;
