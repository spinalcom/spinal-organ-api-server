import { expect } from 'chai';
import request from 'supertest';
import { Model, Ptr } from 'spinal-core-connectorjs';
import { SpinalNode } from 'spinal-model-graph';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { createSpatialFixture, type SpatialFixture } from './helpers/spatialFixture';

const registerGetNodeById = require('../../src/routes/v2/node/getNodeById');
const registerCreateNode = require('../../src/routes/v2/node/createNode');

describe('GET /api/v2/node/:nodeId', () => {
  let fixture: SpatialFixture;
  beforeEach(async () => {
    fixture = await createSpatialFixture();
    registerGetNodeById(null, fixture.app, fixture.middleware);
  });
  afterEach(() => { fixture.cleanup(); });

  it('returns a custom node with default info using the current profile', async () => {
    const node = fixture.node('Sensor', 'customSensor');
    const response = await request(fixture.app).get(`/api/v2/node/${node._server_id}`).expect(200);
    expect(response.body).to.deep.equal({
      data: {
        dynamicId: node._server_id,
        info: { staticId: node.getId().get(), name: 'Sensor', type: 'customSensor' },
      },
    });
    expect(fixture.loads).to.deep.equal([node._server_id]);
    expect(fixture.graphReads).to.equal(0);
  });

  it('accepts geographic nodes and SpinalContext subclasses without type restrictions', async () => {
    for (const node of [fixture.room, fixture.equipment, fixture.context]) {
      const response = await request(fixture.app).get(`/api/v2/node/${node._server_id}`)
        .query({ info: 'name,type' }).expect(200);
      expect(response.body.data.info).to.deep.equal({
        name: node.getName().get(), type: node.getType().get(),
      });
    }
  });

  it('retrieves a node created through POST with an element without serializing the element', async () => {
    registerCreateNode(null, fixture.app, fixture.middleware);
    const created = await request(fixture.app).post('/api/v2/node').send({
      info: { name: 'Sensor', type: 'sensor' },
      element: { device: { $modelRef: fixture.equipment._server_id } },
      parents: [{ parentDynamicId: fixture.room._server_id, relationName: 'hasSensor' }],
    }).expect(201);
    const response = await request(fixture.app).get(`/api/v2/node/${created.body.data.dynamicId}`)
      .query({ info: 'true', attributes: 'true' }).expect(200);
    expect(response.body.data).to.deep.equal(created.body.data);
    expect(response.body.data).not.to.have.property('element');
  });

  it('supports all info and selected info including false and zero values', async () => {
    fixture.room.info.add_attr({ active: false, count: 0, extra: 'custom' });
    const all = await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`)
      .query({ info: 'true' }).expect(200);
    expect(all.body.data.info).to.include({ active: false, count: 0, extra: 'custom' });
    const selected = await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`)
      .query({ info: 'active,count' }).expect(200);
    expect(selected.body.data.info).to.deep.equal({ active: false, count: 0 });
  });

  it('projects nested info and array references while preserving staticId and default output', async () => {
    const shared = new Model({ value: 42 });
    fixture.room.info.add_attr({
      metadata: { unit: 'Celsius', device: shared },
      samples: [0, { device: shared, other: 'omit' }],
    });
    const path = `/api/v2/node/${fixture.room._server_id}`;
    const defaults = await request(fixture.app).get(path).expect(200);
    expect(defaults.body.data.info).not.to.have.property('metadata');
    const all = await request(fixture.app).get(path).query({ info: 'true' }).expect(200);
    expect(all.body.data.info.metadata).to.deep.equal({ unit: 'Celsius', device: { value: 42 } });
    expect(all.body.data.info.staticId).to.equal(fixture.room.getId().get());
    expect(all.body.data.info).not.to.have.property('id');
    const selected = await request(fixture.app).get(path).query({
      info: 'staticId,metadata.device.value,samples.1.device.value,missing',
    }).expect(200);
    expect(selected.body.data.info).to.deep.equal({
      staticId: fixture.room.getId().get(), metadata: { device: { value: 42 } },
      samples: [null, { device: { value: 42 } }],
    });
  });

  it('does not load info pointers and detects cycles only in selected info branches', async () => {
    const target = new Model({ value: 42 });
    fixture.register(target);
    const pointer = new Ptr(target);
    pointer.load = () => { throw new Error('Must not load'); };
    const cyclic = new Model();
    cyclic.add_attr('self', cyclic);
    fixture.room.info.add_attr({ pointer, cyclic });
    const path = `/api/v2/node/${fixture.room._server_id}`;
    const selected = await request(fixture.app).get(path).query({ info: 'pointer,name' }).expect(200);
    expect(selected.body.data.info).to.deep.equal({
      pointer: { $ptr: target._server_id }, name: 'Room',
    });
    await request(fixture.app).get(path).query({ info: 'true' }).expect(500);
    await request(fixture.app).get(path).expect(200);
  });

  async function withElement(element: Model) {
    const node = new SpinalNode('Sensor', 'sensor', element);
    fixture.register(node);
    return `/api/v2/node/${node._server_id}`;
  }

  it('returns the full element with nested objects, arrays and falsy values', async () => {
    const data = { value: 0, enabled: false, unit: '', metadata: { unit: 'Celsius' }, samples: [20, 21], empty: {} };
    const path = await withElement(new Model(data));
    const response = await request(fixture.app).get(path).query({ element: 'true', info: 'false' }).expect(200);
    expect(response.body.data.element).to.deep.equal(data);
    expect(response.body.data).not.to.have.property('info');
  });

  it('selects nested paths and array indexes while preserving structure', async () => {
    const path = await withElement(new Model({
      value: 0, other: 'omit', metadata: { unit: 'Celsius', other: 'omit' },
      samples: [{ value: 20 }, { value: 21, other: 'omit' }],
    }));
    const response = await request(fixture.app).get(path).query({
      element: 'value,metadata.unit,samples.1.value,missing,metadata.absent',
    }).expect(200);
    expect(response.body.data.element).to.deep.equal({
      value: 0, metadata: { unit: 'Celsius' }, samples: [null, { value: 21 }],
    });
    const overlap = await request(fixture.app).get(path).query({ element: 'metadata.unit,metadata' }).expect(200);
    expect(overlap.body.data.element).to.deep.equal({ metadata: { unit: 'Celsius', other: 'omit' } });
  });

  it('does not load an element when omitted or false, and never creates a missing element', async () => {
    const original = fixture.room.getElement;
    fixture.room.getElement = () => { throw new Error('Must not load'); };
    for (const element of [undefined, 'false']) {
      await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`)
        .query(element ? { element } : {}).expect(200);
    }
    fixture.room.getElement = original;
    for (const element of ['true', 'value']) {
      const response = await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`)
        .query({ element }).expect(200);
      expect(response.body.data.element).to.equal(null);
      expect(await fixture.room.getElement(true)).to.equal(undefined);
    }
  });

  it('serializes shared Models but represents nested pointers without loading them', async () => {
    const shared = new Model({ value: 42 });
    fixture.register(shared);
    const ptr = new Ptr(shared);
    ptr.load = () => { throw new Error('Must not dereference'); };
    const element = new Model({ first: shared, second: shared, pointer: ptr, unset: new Ptr() });
    const path = await withElement(element);
    const response = await request(fixture.app).get(path).query({ element: 'true' }).expect(200);
    expect(response.body.data.element).to.deep.equal({
      first: { value: 42 }, second: { value: 42 },
      pointer: { $ptr: shared._server_id }, unset: { $ptr: null },
    });
    const selected = await request(fixture.app).get(path).query({ element: 'pointer.value,first.value' }).expect(200);
    expect(selected.body.data.element).to.deep.equal({ first: { value: 42 } });
  });

  it('returns 500 for cycles but permits selection outside the cyclic branch', async () => {
    const element = new Model({ value: 42 });
    element.add_attr('self', element);
    const path = await withElement(element);
    const response = await request(fixture.app).get(path).query({ element: 'true' }).expect(500);
    expect(response.body.errorType).to.equal('INTERNAL_ERROR');
    const selected = await request(fixture.app).get(path).query({ element: 'value' }).expect(200);
    expect(selected.body.data.element).to.deep.equal({ value: 42 });
  });

  it('enforces depth and model-count limits explicitly', async () => {
    let deep = new Model({ value: 1 });
    for (let i = 0; i < 31; i++) deep = new Model({ nested: deep });
    const allowedPath = await withElement(deep);
    await request(fixture.app).get(allowedPath).query({ element: 'true' }).expect(200);
    deep = new Model({ nested: deep });
    const path = await withElement(deep);
    await request(fixture.app).get(path).query({ element: 'true' }).expect(500);
    const wide = new Model();
    for (let i = 0; i < 9999; i++) wide.add_attr(`v${i}`, i);
    const widePath = await withElement(wide);
    await request(fixture.app).get(widePath).query({ element: 'true' }).expect(200);
    wide.add_attr('overflow', 1);
    await request(fixture.app).get(widePath).query({ element: 'true' }).expect(500);
  });

  it('rejects malformed element queries before loading nodes', async () => {
    for (const element of ['value,,unit', 'metadata..unit', '__proto__.x', 'constructor', 'model_id', Array(34).fill('x').join('.')]) {
      await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`).query({ element }).expect(400);
    }
    await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}?element=true&element=value`).expect(400);
    expect(fixture.loads).to.deep.equal([]);
  });

  it('omits info for info=false while supporting attribute projection and modification dates', async () => {
    await attributeService.createOrUpdateAttrsAndCategories(fixture.room, 'Technical', { Code: '001', Unit: 'Celsius' });
    const response = await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`).query({
      info: 'false', attributes: 'Technical/Code', 'add-attributes-modification-date': 'true',
    }).expect(200);
    expect(response.body.data).not.to.have.property('info');
    expect(response.body.data.attributes.Technical).to.have.keys('Code');
    expect(response.body.data.attributes.Technical.Code.value).to.equal('001');
    expect(response.body.data.attributes.Technical.Code.lastModification).to.be.a('number');
  });

  it('supports all attributes and attributes=false', async () => {
    await attributeService.createOrUpdateAttrsAndCategories(fixture.room, 'Technical', { Code: '001' });
    const all = await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`)
      .query({ attributes: 'true' }).expect(200);
    expect(all.body.data.attributes).to.deep.equal({ Technical: { Code: '001' } });
    const none = await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`)
      .query({ attributes: 'false' }).expect(200);
    expect(none.body.data).not.to.have.property('attributes');
  });

  it('reports unknown nodes and non-SpinalNode Models as 400', async () => {
    const model = new Model({ value: 1 });
    fixture.register(model);
    for (const id of [9999999, model._server_id]) {
      const response = await request(fixture.app).get(`/api/v2/node/${id}`).expect(400);
      expect(response.body.errorType).to.equal('INVALID_LOAD_NODE_TYPE');
      expect(response.body).not.to.have.property('data');
    }
  });

  it('rejects invalid IDs and unknown or malformed query parameters before loading', async () => {
    for (const id of ['0', '-1', '1.5', 'not-a-number', 'Infinity', '9007199254740992']) {
      await request(fixture.app).get(`/api/v2/node/${id}`).expect(400);
    }
    for (const query of [{ unknown: 'x' }, { 'add-attributes-modification-date': 'invalid' }]) {
      await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`).query(query).expect(400);
    }
    expect(fixture.loads).to.deep.equal([]);
  });

  it('returns 500 for unexpected serialization errors without exposing internal details', async () => {
    fixture.room.info.id.get = () => { throw new Error('private details'); };
    const response = await request(fixture.app).get(`/api/v2/node/${fixture.room._server_id}`).expect(500);
    expect(response.body.errorType).to.equal('INTERNAL_ERROR');
    expect(JSON.stringify(response.body)).not.to.include('private details');
    expect(response.body).not.to.have.property('data');
  });
});
