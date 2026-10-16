import { expect } from 'chai';
import request from 'supertest';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { FLOOR_RELATION } from 'spinal-env-viewer-context-geographic-service';
import { SPINAL_RELATION_PTR_LST_TYPE } from 'spinal-model-graph';
import { createSpatialFixture, type SpatialFixture } from './helpers/spatialFixture';

describe('v2 building, floor and individual node GET routes', () => {
  let fixture: SpatialFixture;
  beforeEach(async () => { fixture = await createSpatialFixture(); });
  afterEach(() => { fixture.cleanup(); });

  it('returns the building with default info and no attributes', async () => {
    const response = await request(fixture.app).get('/api/v2/building').expect(200);
    expect(response.body.data).to.deep.equal({
      dynamicId: fixture.building._server_id,
      info: {
        staticId: fixture.building.getId().get(),
        name: 'Building',
        type: fixture.building.getType().get(),
      },
    });
  });

  for (const kind of ['building', 'floor', 'room', 'equipment'] as const) {
    const variants = kind === 'building' ? ['list'] : ['list', 'byId'];
    for (const variant of variants) {
      it(`distinguishes omitted info from info=false for ${kind} ${variant}`, async () => {
        const path = `/api/v2/${kind}${variant === 'byId' ? `/${fixture[kind]._server_id}` : ''}`;
        await attributeService.createOrUpdateAttrsAndCategories(fixture[kind], 'Custom', { Code: '001' });
        const defaultResponse = await request(fixture.app).get(path).expect(200);
        const defaultItem = Array.isArray(defaultResponse.body.data)
          ? defaultResponse.body.data[0] : defaultResponse.body.data;
        expect(defaultItem.info).to.deep.equal({
          staticId: fixture[kind].getId().get(),
          name: fixture[kind].getName().get(),
          type: fixture[kind].getType().get(),
        });
        const response = await request(fixture.app).get(path).query({
          info: 'false', attributes: 'Custom/Code',
          ...(variant === 'list' && (kind === 'room' || kind === 'equipment')
            ? { 'filter[info.name]': fixture[kind].getName().get() } : {}),
        }).expect(200);
        const item = Array.isArray(response.body.data) ? response.body.data[0] : response.body.data;
        expect(item).not.to.have.property('info');
        expect(item.dynamicId).to.equal(fixture[kind]._server_id);
        expect(item.attributes).to.deep.equal({ Custom: { Code: '001' } });
      });
    }
  }

  it('lists only floors linked in the geographic context', async () => {
    const another = fixture.node('Second floor', fixture.floor.getType().get());
    await fixture.link(fixture.building, another, FLOOR_RELATION);
    const response = await request(fixture.app).get('/api/v2/floor')
      .query({ info: 'name' }).expect(200);
    expect(response.body).to.deep.equal({
      data: [fixture.floor, another].map((node) => ({
        dynamicId: node._server_id, info: { name: node.getName().get() },
      })),
    });
  });

  it('returns an empty floor list when the building has no floors', async () => {
    await fixture.building.removeChild(fixture.floor, FLOOR_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
    const response = await request(fixture.app).get('/api/v2/floor').expect(200);
    expect(response.body).to.deep.equal({ data: [] });
  });

  for (const path of ['/api/v2/building', '/api/v2/floor']) {
    it(`reports a missing building for ${path}`, async () => {
      await fixture.removeBuilding();
      const response = await request(fixture.app).get(path).expect(400);
      expect(response.body).to.deep.equal({
        errorType: 'ERROR_DATABASE', message: 'No building found in database',
      });
    });
  }

  for (const kind of ['building', 'floor'] as const) {
    it(`supports info and attribute projections for the ${kind} GET`, async () => {
      await attributeService.createOrUpdateAttrsAndCategories(fixture[kind], 'Spatial', { area: '42', code: '001' });
      fixture[kind].info.add_attr('extra', 'custom');
      const response = await request(fixture.app).get(`/api/v2/${kind}`).query({
        info: 'true', attributes: 'Spatial/area', 'add-attributes-modification-date': 'true',
      }).expect(200);
      const data = kind === 'floor' ? response.body.data[0] : response.body.data;
      expect(data.info.extra).to.equal('custom');
      expect(data.attributes.Spatial).to.have.keys('area');
      expect(data.attributes.Spatial.area.value).to.equal('42');
      expect(data.attributes.Spatial.area.lastModification).to.be.a('number');
    });
  }

  for (const kind of ['floor', 'room', 'equipment'] as const) {
    describe(`GET /api/v2/${kind}/:id`, () => {
      it('loads the requested type and forwards the profile ID', async () => {
        const node = fixture[kind];
        const response = await request(fixture.app).get(`/api/v2/${kind}/${node._server_id}`)
          .query({ info: 'staticId,name,type' }).expect(200);
        expect(response.body.data).to.deep.equal({
          dynamicId: node._server_id,
          info: { staticId: node.getId().get(), name: node.getName().get(), type: node.getType().get() },
        });
        expect(fixture.loads).to.deep.equal([node._server_id]);
      });

      it('supports selected attributes and modification dates', async () => {
        const node = fixture[kind];
        await attributeService.createOrUpdateAttrsAndCategories(node, 'Geometry', { Surface: '25', Code: '001' });
        const response = await request(fixture.app).get(`/api/v2/${kind}/${node._server_id}`).query({
          info: 'name', attributes: 'Geometry/Surface', 'add-attributes-modification-date': 'true',
        }).expect(200);
        expect(response.body.data.attributes.Geometry).to.have.keys('Surface');
        expect(response.body.data.attributes.Geometry.Surface.value).to.equal('25');
        expect(response.body.data.attributes.Geometry.Surface.lastModification).to.be.a('number');
      });

      it('rejects a node of the wrong type', async () => {
        const wrong = kind === 'room' ? fixture.floor : fixture.room;
        const response = await request(fixture.app).get(`/api/v2/${kind}/${wrong._server_id}`).expect(400);
        expect(response.body.errorType).to.equal('INVALID_LOAD_NODE_TYPE');
      });

      it('reports an unknown ID', async () => {
        const response = await request(fixture.app).get(`/api/v2/${kind}/9999999`).expect(400);
        expect(response.body.errorType).to.equal('INVALID_LOAD_NODE_TYPE');
      });

      it('rejects invalid IDs and query parameters before loading', async () => {
        for (const id of ['0', '-1', 'not-a-number']) {
          await request(fixture.app).get(`/api/v2/${kind}/${id}`).expect(400);
        }
        for (const query of [{ unknown: 'x' }, { 'add-attributes-modification-date': 'invalid' }]) {
          await request(fixture.app).get(`/api/v2/${kind}/${fixture[kind]._server_id}`).query(query).expect(400);
        }
        expect(fixture.loads).to.deep.equal([]);
      });
    });
  }

  it('rejects unknown query parameters on building and floor listings', async () => {
    for (const path of ['/api/v2/building', '/api/v2/floor']) {
      await request(fixture.app).get(path).query({ unknown: 'x' }).expect(400);
    }
    expect(fixture.graphReads).to.equal(0);
  });
});
