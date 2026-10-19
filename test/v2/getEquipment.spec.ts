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
  BUILDING_TYPE,
  BUILDING_RELATION,
  FLOOR_TYPE,
  FLOOR_RELATION,
  ROOM_TYPE,
  ROOM_RELATION,
  EQUIPMENT_TYPE,
  EQUIPMENT_RELATION,
  REFERENCE_ROOM_RELATION,
  REFERENCE_RELATION,
} from 'spinal-env-viewer-context-geographic-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalAttribute } from 'spinal-models-documentation';

const registerGetEquipment = require('../../src/routes/v2/geographicContext/equipment/getEquipment');

describe('GET /api/v2/equipment filters and pagination', () => {
  let app: express.Express;
  let originalSigServer: boolean;
  let graph: SpinalGraph;
  let context: SpinalContext;
  let building: SpinalNode;
  let graphReads = 0;
  const parents = new Map<number, SpinalNode>();
  const registeredObjects = new Map<number, spinal.Model | undefined>();

  function registerNode(name: string, type: string, id: number): SpinalNode {
    const node = new SpinalNode(name, type);
    node._server_id = id;
    registeredObjects.set(id, FileSystem._objects[id]);
    FileSystem._objects[id] = node;
    parents.set(id, node);
    return node;
  }

  before(async () => {
    originalSigServer = FileSystem._sig_server;
    FileSystem._sig_server = true;
    graph = new SpinalGraph();
    context = new SpinalContext('spatial', CONTEXT_TYPE);
    await graph.addContext(context);
    building = registerNode('Building', BUILDING_TYPE, 910000);
    const floor = registerNode('Floor', FLOOR_TYPE, 910001);
    const firstRoom = registerNode('Room A', ROOM_TYPE, 910002);
    const secondRoom = registerNode('Room B', ROOM_TYPE, 910003);
    await context.addChildInContext(building, BUILDING_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context);
    await building.addChildInContext(floor, FLOOR_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context);
    for (const room of [firstRoom, secondRoom]) {
      await floor.addChildInContext(room, ROOM_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context);
    }
    const equipment: SpinalNode[] = [];
    for (let index = 0; index < 205; index++) {
      const node = registerNode(`Equipment ${index}`, EQUIPMENT_TYPE, 920000 + index);
      node.info.add_attr('virtual', false);
      equipment.push(node);
      await firstRoom.addChildInContext(node, EQUIPMENT_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context);
    }
    await secondRoom.addChildInContext(equipment[0], EQUIPMENT_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context);
    const otherEquipment = registerNode('Other equipment', EQUIPMENT_TYPE, 930000);
    await secondRoom.addChildInContext(otherEquipment, EQUIPMENT_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context);
    const attributes = new Lst<SpinalAttribute>();
    attributes.push(new SpinalAttribute('Surface', '25'));
    const category = new SpinalNode('Geometry', 'category', attributes);
    await equipment[0].addChild(category, NODE_TO_CATEGORY_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
    const group = registerNode('Equipment group', `${EQUIPMENT_TYPE}Group`, 910004);
    await group.addChild(equipment[0], `groupHas${EQUIPMENT_TYPE}`, SPINAL_RELATION_PTR_LST_TYPE);
    const roomReference = registerNode('Room reference', EQUIPMENT_TYPE, 940000);
    await firstRoom.addChild(roomReference, REFERENCE_ROOM_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
    const floorReference = registerNode('Floor reference', EQUIPMENT_TYPE, 940001);
    await floor.addChildInContext(floorReference, REFERENCE_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context);
    const wrongType = registerNode('Not equipment', ROOM_TYPE, 950000);
    await firstRoom.addChildInContext(wrongType, EQUIPMENT_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context);

    app = express();
    app.set('query parser', 'extended');
    app.use((req, _res, next) => {
      Object.assign(req, { profileId: 'equipment-profile' });
      next();
    });
    registerGetEquipment(null, app, {
      async getProfileGraph(profileId: string) {
        expect(profileId).to.equal('equipment-profile');
        graphReads++;
        return graph;
      },
      async load(id: number, profileId: string) {
        expect(profileId).to.equal('equipment-profile');
        const node = parents.get(id);
        if (!node) throw new Error('Parent not found');
        return node;
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

  it('caps the default listing at 200 and returns each room parent ID', async () => {
    const response = await request(app).get('/api/v2/equipment').query({ info: 'name' }).expect(200);
    expect(response.body.offset).to.equal(0);
    expect(response.body).not.to.have.property('total');
    expect(response.body.data).to.have.length(200);
    expect(response.body.data[0]).to.deep.equal({
      dynamicId: 920000, parentDynamicId: 910002, info: { name: 'Equipment 0' },
    });
  });

  it('preserves different parents for the same equipment across rooms', async () => {
    const response = await request(app).get('/api/v2/equipment').query({
      filter: JSON.stringify({ dynamicId: 920000 }),
      info: 'name',
    }).expect(200);
    expect(response.body.data).to.deep.equal([910002, 910003].map((parentDynamicId) => ({
      dynamicId: 920000, parentDynamicId, info: { name: 'Equipment 0' },
    })));
  });

  it('paginates the context iterable across room boundaries', async () => {
    const response = await request(app).get('/api/v2/equipment').query({
      offset: '200', info: 'name', 'filter[info.type]': EQUIPMENT_TYPE,
    }).expect(200);
    expect(response.body.data.map((item: { dynamicId: number; parentDynamicId: number }) =>
      [item.dynamicId, item.parentDynamicId]
    )).to.deep.equal([
      [920200, 910002], [920201, 910002], [920202, 910002],
      [920203, 910002], [920204, 910002], [920000, 910003], [930000, 910003],
    ]);
    expect(response.body.offset).to.equal(200);
  });

  it('filters before pagination for a room parent and excludes non-equipment children', async () => {
    const response = await request(app).get('/api/v2/equipment').query({
      'parent-dynamic-id': '910002',
      'filter[attributes.Geometry.Surface][exists]': 'false',
      offset: '200',
      info: 'name',
    }).expect(200);
    expect(response.body.data).to.deep.equal([201, 202, 203, 204].map((index) => ({
      dynamicId: 920000 + index, parentDynamicId: 910002, info: { name: `Equipment ${index}` },
    })));
    expect(response.body.total).to.equal(205);
  });

  it('accepts all filter encodings, shorthand equality and numeric attributes', async () => {
    for (const query of [
      {
        'filter[info.virtual][eq]': 'false',
        'filter[attributes.Geometry.Surface][exists]': 'true',
        'filter[attributes.Geometry.Surface][gte]': '20',
      },
      {
        'filter[info.virtual]': '{"eq":"false"}',
        'filter[attributes.Geometry.Surface]': '{"exists":true,"gte":20}',
      },
      { filter: '{"info.virtual":{"eq":"false"},"attributes.Geometry.Surface":{"exists":true,"gte":20}}' },
      { filter: '{"info.virtual":false,"attributes.Geometry.Surface":"25"}' },
    ]) {
      const response = await request(app).get('/api/v2/equipment').query({
        ...query, 'parent-dynamic-id': '910002', info: 'name',
      }).expect(200);
      expect(response.body.data).to.deep.equal([{
        dynamicId: 920000, parentDynamicId: 910002, info: { name: 'Equipment 0' },
      }]);
    }
  });

  it('supports group parents for every bimObjectType and includes requested attributes', async () => {
    for (const bimObjectType of ['bimobject', 'referenceRoom', 'referenceFloor']) {
      const response = await request(app).get('/api/v2/equipment').query({
        'parent-dynamic-id': '910004', bimObjectType,
        info: 'name', attributes: 'Geometry/Surface',
        'add-attributes-modification-date': 'true',
      }).expect(200);
      expect(response.body.data).to.have.length(1);
      expect(response.body.data[0].parentDynamicId).to.equal(910004);
      expect(response.body.data[0].attributes.Geometry.Surface.value).to.equal('25');
      expect(response.body.data[0].attributes.Geometry.Surface.lastModification).to.be.a('number');
      expect(response.body.total).to.equal(1);
    }
  });

  for (const [bimObjectType, parentId, id, name] of [
    ['referenceRoom', 910002, 940000, 'Room reference'],
    ['referenceFloor', 910001, 940001, 'Floor reference'],
  ] as const) {
    it(`retrieves ${bimObjectType} with and without a parent`, async () => {
      for (const query of [{ bimObjectType }, { bimObjectType, 'parent-dynamic-id': String(parentId) }]) {
        const response = await request(app).get('/api/v2/equipment')
          .query({ ...query, info: 'name' }).expect(200);
        expect(response.body.data).to.deep.equal([{
          dynamicId: id, parentDynamicId: parentId, info: { name },
        }]);
      }
    });
  }

  it('returns empty pages for unmatched filters, exhausted offsets and incompatible parents', async () => {
    for (const query of [
      { 'filter[info.name]': 'Missing equipment' },
      { offset: '1000' },
      { 'parent-dynamic-id': '910001', bimObjectType: 'bimobject' },
    ]) {
      const response = await request(app).get('/api/v2/equipment').query(query).expect(200);
      expect(response.body.data).to.deep.equal([]);
    }
  });

  it('rejects malformed queries before graph access', async () => {
    const beforeReads = graphReads;
    for (const query of [
      { bimObjectType: 'invalid' },
      { 'parent-dynamic-id': '0' },
      { filter: '{' },
      { filter: 'null' },
      { 'filter[info.name][unsupported]': 'x' },
      { 'filter[info.name][eq]': ['a', 'b'] },
      { 'filter[info.name][exists]': 'undefined' },
      { offset: '-1' },
      { offset: 'invalid' },
      { unknown: 'value' },
    ]) {
      await request(app).get('/api/v2/equipment').query(query).expect(400);
    }
    expect(graphReads).to.equal(beforeReads);
  });

  it('rejects invalid parents and invalid pagination offsets', async () => {
    for (const query of [
      { 'parent-dynamic-id': '999999' },
      { offset: '1.5' },
      { offset: '9007199254740992' },
    ]) {
      await request(app).get('/api/v2/equipment').query(query).expect(400);
    }
  });

  it('reports a missing building when listing the context', async () => {
    await context.removeChild(building, BUILDING_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
    try {
      const response = await request(app).get('/api/v2/equipment').expect(400);
      expect(response.body).to.deep.equal({
        errorType: 'ERROR_DATABASE', message: 'No building found in database',
      });
    } finally {
      await context.addChildInContext(building, BUILDING_RELATION, SPINAL_RELATION_PTR_LST_TYPE, context);
    }
  });
});
