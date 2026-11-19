import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';
import { FileSystem } from 'spinal-core-connectorjs';
import {
  SpinalContext,
  SpinalGraph,
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-model-graph';
import { CONTEXT_TYPE } from 'spinal-env-viewer-context-geographic-service';

const registerSearchNodeChildren = require('../../src/routes/v2/node/searchNodeChildren');

describe('POST /api/v2/node/children/search', () => {
  let app: express.Express;
  let originalSigServer: boolean;
  const registeredObjects = new Map<number, spinal.Model | undefined>();
  const nodes = new Map<number, SpinalNode>();

  before(async () => {
    originalSigServer = FileSystem._sig_server;
    FileSystem._sig_server = true;
    const graph = new SpinalGraph();
    const context = new SpinalContext('spatial', CONTEXT_TYPE);
    await graph.addContext(context);

    const create = (id: number, name: string) => {
      const node = new SpinalNode(name, 'test-type');
      node._server_id = id;
      registeredObjects.set(id, FileSystem._objects[id]);
      FileSystem._objects[id] = node;
      nodes.set(id, node);
      return node;
    };

    const parentA = create(60, 'ParentA');
    const parentB = create(61, 'ParentB');
    const c1 = create(70001, 'Child 1');
    const c2 = create(70002, 'Child 2');
    const c3 = create(70003, 'Child 3');
    const c4 = create(70004, 'Child 4');

    await parentA.addChild(c1, 'hasItem', SPINAL_RELATION_PTR_LST_TYPE);
    await parentA.addChild(c2, 'hasItem', SPINAL_RELATION_PTR_LST_TYPE);
    await parentA.addChild(c2, 'hasOther', SPINAL_RELATION_PTR_LST_TYPE);
    await parentA.addChild(c3, 'hasOther', SPINAL_RELATION_PTR_LST_TYPE);
    await parentB.addChild(c2, 'hasItem', SPINAL_RELATION_PTR_LST_TYPE);
    await parentB.addChild(c4, 'hasItem', SPINAL_RELATION_PTR_LST_TYPE);

    app = express();
    app.use(bodyParser.json());
    app.use((req, _res, next) => {
      Object.assign(req, { profileId: 'test-profile' });
      next();
    });
    registerSearchNodeChildren(null, app, {
      async getProfileGraph() {
        return graph;
      },
      async load(id: number) {
        const node = nodes.get(id);
        if (!node) throw new Error('Node not found');
        return node;
      },
    } as any);
  });

  after(() => {
    for (const [id, previous] of registeredObjects) {
      if (previous === undefined) delete FileSystem._objects[id];
      else FileSystem._objects[id] = previous;
    }
    FileSystem._sig_server = originalSigServer;
  });

  it('lists children of each parent, deduplicated per parent, tagged with parentDynamicId', async () => {
    const response = await request(app)
      .post('/api/v2/node/children/search')
      .send({ parentIds: [60, 61], info: 'name' })
      .expect(200);
    expect(response.body.offset).to.equal(0);
    expect(response.body.total).to.equal(5);
    expect(response.body.data).to.deep.equal([
      { dynamicId: 70001, parentDynamicId: 60, info: { name: 'Child 1' } },
      { dynamicId: 70002, parentDynamicId: 60, info: { name: 'Child 2' } },
      { dynamicId: 70003, parentDynamicId: 60, info: { name: 'Child 3' } },
      { dynamicId: 70002, parentDynamicId: 61, info: { name: 'Child 2' } },
      { dynamicId: 70004, parentDynamicId: 61, info: { name: 'Child 4' } },
    ]);
  });

  it('ignores duplicate parent ids', async () => {
    const response = await request(app)
      .post('/api/v2/node/children/search')
      .send({ parentIds: [61, 61], info: 'name' })
      .expect(200);
    expect(response.body.data.map((item: any) => item.dynamicId)).to.deep.equal([70002, 70004]);
  });

  it('restricts traversal to the requested relation names', async () => {
    const response = await request(app)
      .post('/api/v2/node/children/search')
      .send({ parentIds: [60, 61], relationNames: ['hasOther'], info: 'name' })
      .expect(200);
    expect(response.body.data).to.deep.equal([
      { dynamicId: 70002, parentDynamicId: 60, info: { name: 'Child 2' } },
      { dynamicId: 70003, parentDynamicId: 60, info: { name: 'Child 3' } },
    ]);
  });

  it('pages over the combined sequence with a global offset', async () => {
    const response = await request(app)
      .post('/api/v2/node/children/search')
      .send({ parentIds: [60, 61], offset: 3, info: 'name' })
      .expect(200);
    expect(response.body.offset).to.equal(3);
    expect(response.body.data.map((item: any) => [item.dynamicId, item.parentDynamicId])).to.deep.equal([
      [70002, 61],
      [70004, 61],
    ]);
  });

  it('rejects a missing parentIds', async () => {
    await request(app).post('/api/v2/node/children/search').send({}).expect(400);
  });

  it('rejects an empty parentIds', async () => {
    await request(app).post('/api/v2/node/children/search').send({ parentIds: [] }).expect(400);
  });

  it('rejects more than 50 parent ids', async () => {
    const parentIds = Array.from({ length: 51 }, (_, index) => index + 1000);
    await request(app).post('/api/v2/node/children/search').send({ parentIds }).expect(400);
  });

  it('rejects unknown body keys', async () => {
    await request(app)
      .post('/api/v2/node/children/search')
      .send({ parentIds: [60], unknown: true })
      .expect(400);
  });
});
