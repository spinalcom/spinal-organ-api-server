import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import { FileSystem, Lst } from 'spinal-core-connectorjs';
import {
  SpinalContext,
  SpinalGraph,
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-model-graph';
import {
  CONTEXT_TYPE,
  FLOOR_TYPE,
  ROOM_TYPE,
  ROOM_RELATION,
  BUILDING_TYPE,
  BUILDING_RELATION,
  FLOOR_RELATION,
} from 'spinal-env-viewer-context-geographic-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalAttribute } from 'spinal-models-documentation';

const registerGetRoom = require('../../src/routes/v2/geographicContext/room/getRoom');

describe('GET /api/v2/room filters and pagination', () => {
  let app: express.Express;
  let originalSigServer: boolean;
  const registeredObjects = new Map<number, spinal.Model | undefined>();
  const rooms: SpinalNode[] = [];
  let graphReads = 0;

  before(async () => {
    originalSigServer = FileSystem._sig_server;
    FileSystem._sig_server = true;
    const graph = new SpinalGraph();
    const context = new SpinalContext('spatial', CONTEXT_TYPE);
    await graph.addContext(context);
    const floor = new SpinalNode('Floor', FLOOR_TYPE);
    floor._server_id = 50;
    const building = new SpinalNode('Building', BUILDING_TYPE);
    await context.addChildInContext(
      building, BUILDING_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context
    );
    await building.addChildInContext(
      floor, FLOOR_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context
    );
    for (let index = 0; index < 205; index++) {
      const room = new SpinalNode(`Room ${index}`, ROOM_TYPE);
      room.info.add_attr('virtual', false);
      room._server_id = 900000 + index;
      registeredObjects.set(room._server_id, FileSystem._objects[room._server_id]);
      FileSystem._objects[room._server_id] = room;
      rooms.push(room);
      await floor.addChildInContext(
        room, ROOM_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context
      );
    }
    const attributes = new Lst<SpinalAttribute>();
    attributes.push(new SpinalAttribute('Surface', '25'));
    const category = new SpinalNode('Geometry', 'category', attributes);
    await rooms[0].addChild(
      category, NODE_TO_CATEGORY_RELATION, SPINAL_RELATION_PTR_LST_TYPE
    );
    const group = new SpinalNode('Group', `${ROOM_TYPE}Group`);
    await group.addChild(rooms[0], `groupHas${ROOM_TYPE}`, SPINAL_RELATION_PTR_LST_TYPE);
    app = express();
    app.set('query parser', 'extended');
    app.use((req, _res, next) => {
      Object.assign(req, { profileId: 'test-profile' });
      next();
    });
    registerGetRoom(null, app, {
      async getProfileGraph(profileId: string) {
        expect(profileId).to.equal('test-profile');
        graphReads++;
        return graph;
      },
      async load(id: number, profileId: string) {
        expect(profileId).to.equal('test-profile');
        if (id === 50) return floor;
        if (id === 51) return group;
        throw new Error('Parent not found');
      },
    });
  });

  after(() => {
    for (const [id, previous] of registeredObjects) {
      if (previous === undefined) delete FileSystem._objects[id];
      else FileSystem._objects[id] = previous;
    }
    FileSystem._sig_server = originalSigServer;
  });

  it('caps the default geographic context listing at 200 rooms', async () => {
    const response = await request(app).get('/api/v2/room').query({ info: 'name' }).expect(200);
    expect(response.body.offset).to.equal(0);
    expect(response.body.data).to.have.length(200);
    expect(response.body.data[0]).to.deep.equal({
      dynamicId: 900000, parentDynamicId: 50, info: { name: 'Room 0' },
    });
  });

  it('filters before offset and projects only requested fields', async () => {
    const response = await request(app).get('/api/v2/room').query({
      'parent-dynamic-id': '50',
      'filter[attributes.Geometry.Surface][exists]': 'false',
      'filter[info.virtual][eq]': 'false',
      offset: '200',
      info: 'name',
    }).expect(200);
    expect(response.body.offset).to.equal(200);
    expect(response.body.data).to.deep.equal(
      [201, 202, 203, 204].map((index) => ({
        dynamicId: 900000 + index,
        parentDynamicId: 50,
        info: { name: `Room ${index}` },
      }))
    );
  });

  it('supports attribute existence and numeric comparisons without a parent', async () => {
    const response = await request(app).get('/api/v2/room').query({
      'filter[attributes.Geometry.Surface][exists]': 'true',
      'filter[attributes.Geometry.Surface][gte]': '20',
      info: 'name',
    }).expect(200);
    expect(response.body.data).to.deep.equal([
      { dynamicId: 900000, parentDynamicId: 50, info: { name: 'Room 0' } },
    ]);
  });

  it('accepts all three filter formats over HTTP with identical results', async () => {
    const filter = {
      'info.virtual': { eq: 'false' },
      'attributes.Geometry.Surface': { exists: 'true', gte: '20' },
    };
    const formats = [
      {
        'filter[info.virtual][eq]': 'false',
        'filter[attributes.Geometry.Surface][exists]': 'true',
        'filter[attributes.Geometry.Surface][gte]': '20',
      },
      {
        'filter[info.virtual]': JSON.stringify(filter['info.virtual']),
        'filter[attributes.Geometry.Surface]': JSON.stringify(filter['attributes.Geometry.Surface']),
      },
      { filter: JSON.stringify(filter) },
      {
        'filter[info.virtual]': 'false',
        'filter[attributes.Geometry.Surface]': '{"exists":"true","gte":"20"}',
      },
      {
        filter: JSON.stringify({
          'info.virtual': false,
          'attributes.Geometry.Surface': { exists: true, gte: 20 },
        }),
      },
    ];
    for (const query of formats) {
      const response = await request(app).get('/api/v2/room')
        .query({ ...query, info: 'name', 'parent-dynamic-id': '50' }).expect(200);
      expect(response.body).to.deep.equal({
        data: [{ dynamicId: 900000, parentDynamicId: 50, info: { name: 'Room 0' } }],
        offset: 0,
        total: 205,
      });
    }
  });

  it('supports JSON missing-attribute checks with pagination', async () => {
    const response = await request(app).get('/api/v2/room').query({
      filter: JSON.stringify({ 'attributes.Geometry.Surface': { exists: false } }),
      offset: '200',
      info: 'name',
    }).expect(200);
    expect(response.body.data.map((item: { dynamicId: number }) => item.dynamicId))
      .to.deep.equal([900201, 900202, 900203, 900204]);
    expect(response.body.offset).to.equal(200);
  });

  it('matches scalar attribute equality in bracket and JSON forms', async () => {
    for (const query of [
      { 'filter[attributes.Geometry.Surface]': '25', 'filter[info.virtual]': 'false' },
      { filter: JSON.stringify({ 'attributes.Geometry.Surface': '25', 'info.virtual': false }) },
    ]) {
      const response = await request(app).get('/api/v2/room')
        .query({ ...query, info: 'name' }).expect(200);
      expect(response.body).to.deep.equal({
        data: [{ dynamicId: 900000, parentDynamicId: 50, info: { name: 'Room 0' } }], offset: 0,
      });
    }
  });

  it('preserves room-group parent support and output attributes', async () => {
    const response = await request(app).get('/api/v2/room').query({
      'parent-dynamic-id': '51',
      'filter[attributes.Geometry.Surface][exists]': 'true',
      info: 'name',
      attributes: 'Geometry/Surface',
      'add-attributes-modification-date': 'true',
    }).expect(200);
    expect(response.body.data).to.have.length(1);
    expect(response.body.data[0].parentDynamicId).to.equal(51);
    expect(response.body.data[0].attributes.Geometry.Surface.value).to.equal('25');
    expect(response.body.data[0].attributes.Geometry.Surface.lastModification).to.be.a('number');
  });

  it('returns an empty page beyond the matching rooms', async () => {
    const response = await request(app).get('/api/v2/room').query({
      'filter[attributes.Geometry.Surface][exists]': 'true',
      offset: '1',
    }).expect(200);
    expect(response.body).to.deep.equal({ data: [], offset: 1 });
  });

  it('coerces numeric offsets with Zod', async () => {
    const response = await request(app).get('/api/v2/room').query({
      'filter[attributes.Geometry.Surface][exists]': 'true',
      offset: '1e0',
    }).expect(200);
    expect(response.body).to.deep.equal({ data: [], offset: 1 });
  });

  it('rejects invalid filters and offsets before reading the graph', async () => {
    const readsBefore = graphReads;
    for (const query of [
      { 'filter[info.type][contains]': 'room' },
      { 'filter[info.type][exists]': 'undefined' },
      { filter: 'invalid' },
      { filter: '{' },
      { filter: 'null' },
      { filter: '[]' },
      { filter: '{"info.virtual":{"exists":"undefined"}}' },
      { filter: '{"info.virtual":{"unsupported":false}}' },
      { 'filter[info.virtual]': '{' },
      { 'filter[info.virtual]': '[]' },
      { 'filter[info.virtual]': '{"eq":["false"]}' },
      { 'filter[info.virtual]': '{"eq":"false"}', 'filter[info.virtual][eq]': 'true' },
      { offset: '-1' },
      { offset: 'invalid' },
      { 'filter[info.type][eq]': ['room', 'floor'] },
      { unknown: 'value' },
    ]) {
      await request(app).get('/api/v2/room').query(query).expect(400);
    }
    expect(graphReads).to.equal(readsBefore);
  });

  it('rejects fractional and unsafe offsets in the pagination helper', async () => {
    for (const offset of ['1.5', '9007199254740992']) {
      await request(app).get('/api/v2/room').query({ offset }).expect(400);
    }
  });
});
