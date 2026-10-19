import { expect } from 'chai';
import { Model } from 'spinal-core-connectorjs';
import request from 'supertest';
import {
  BUILDING_RELATION, FLOOR_RELATION, ROOM_RELATION,
  EQUIPMENT_RELATION, REFERENCE_RELATION, REFERENCE_ROOM_RELATION,
} from 'spinal-env-viewer-context-geographic-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import { createSpatialFixture, type SpatialFixture } from './helpers/spatialFixture';

describe('v2 geographic node POST routes', () => {
  let fixture: SpatialFixture;
  beforeEach(async () => { fixture = await createSpatialFixture(); });
  afterEach(() => { fixture.cleanup(); });

  function body(kind: 'building' | 'floor' | 'room' | 'equipment', name = 'New node') {
    const info = { name, color: '#Ab12Cd', icon: 'test-icon', customText: '001', customNumber: 12, customFlag: true };
    if (kind === 'room') return { info, dynamicFloorId: fixture.floor._server_id };
    if (kind === 'equipment') return { info, parentDynamicId: fixture.room._server_id };
    return { info };
  }

  for (const kind of ['building', 'floor', 'room', 'equipment'] as const) {
    describe(`POST /api/v2/${kind}`, () => {
      it('supports forward self references and shares categorized attribute values', async () => {
        if (kind === 'building') await fixture.removeBuilding();
        const payload = body(kind);
        const response = await request(fixture.app).post(`/api/v2/${kind}`).send({
          ...payload, info: {
            ...payload.info,
            alias: { $modelRef: 'self', path: 'info.later' },
            code: { $modelRef: 'self', path: 'attr.Technical.Code' },
            later: { value: 42 },
          }, attributes: { Technical: { Code: '001' } },
        }).expect(201);
        expect(response.body.data.info.alias).to.deep.equal({ value: 42 });
        const created = await fixture.middleware.load<import('spinal-model-graph').SpinalNode>(
          response.body.data.dynamicId, fixture.profileId);
        expect(created.info.alias).to.equal(created.info.later);
        created.info.code.set('002');
        const { getNodeData } = await import('../../src/utilities/v2/node/getNodeData');
        expect((await getNodeData(created, true, true)).attributes!.Technical.Code).to.equal('002');
      });

      it('rejects circular self info before attaching geographic nodes', async () => {
        if (kind === 'building') await fixture.removeBuilding();
        const parent = { building: fixture.context, floor: fixture.building, room: fixture.floor, equipment: fixture.room }[kind];
        const before = await parent.getChildren();
        const payload = body(kind);
        await request(fixture.app).post(`/api/v2/${kind}`).send({
          ...payload, info: {
            ...payload.info,
            a: { $modelRef: 'self', path: 'info.b' },
            b: { $modelRef: 'self', path: 'info.a' },
          },
        }).expect(400);
        expect(await parent.getChildren()).to.deep.equal(before);
      });

      if (kind !== 'equipment') {
        it('can reference default categorized values using self', async () => {
          if (kind === 'building') await fixture.removeBuilding();
          const payload = body(kind);
          const response = await request(fixture.app).post(`/api/v2/${kind}`).send({
            ...payload, info: {
              ...payload.info, defaultArea: { $modelRef: 'self', path: 'attr.Spatial.area' },
            },
          }).expect(201);
          expect(response.body.data.info.defaultArea).to.equal('0');
          expect(response.body.data.attributes.Spatial.area).to.equal('0');
        });
      }
      it('supports nested info and model references', async () => {
        if (kind === 'building') await fixture.removeBuilding();
        const shared = new Model({ value: 42 });
        const target = fixture.node('Target', 'target');
        target.info.add_attr('payload', shared);
        const payload = body(kind);
        const response = await request(fixture.app).post(`/api/v2/${kind}`).send({
          ...payload, info: {
            ...payload.info, metadata: { device: { $modelRef: target._server_id, path: 'info.payload' } },
            samples: [0, false, { $modelRef: target._server_id, path: 'info.payload' }],
          },
        }).expect(201);
        expect(response.body.data.info.metadata).to.deep.equal({ device: { value: 42 } });
        expect(response.body.data.info.samples).to.deep.equal([0, false, { value: 42 }]);
      });

      it('rejects inaccessible info references without attaching a node', async () => {
        if (kind === 'building') await fixture.removeBuilding();
        const parent = { building: fixture.context, floor: fixture.building, room: fixture.floor, equipment: fixture.room }[kind];
        const before = await parent.getChildren();
        const payload = body(kind);
        await request(fixture.app).post(`/api/v2/${kind}`).send({
          ...payload, info: { ...payload.info, source: { $modelRef: 9999999, path: 'info.name' } },
        }).expect(400);
        expect(await parent.getChildren()).to.deep.equal(before);
      });
      it('creates a real graph node with info, attributes and the correct relation', async () => {
        if (kind === 'building') await fixture.removeBuilding();
        const payload = {
          ...body(kind),
          attributes: { Spatial: { area: '42' }, Custom: { Code: '001' } },
        };
        const response = await request(fixture.app).post(`/api/v2/${kind}`).send(payload).expect(201);
        const data = response.body.data;
        expect(data.dynamicId).to.be.a('number');
        expect(data.info).to.include(payload.info);
        expect(data.info.staticId).to.be.a('string');
        expect(data.attributes.Spatial.area).to.equal('42');
        expect(data.attributes.Custom.Code).to.equal('001');
        if (kind !== 'building') expect(data.info.virtual).to.equal(false);
        const relations = {
          building: [fixture.context, BUILDING_RELATION],
          floor: [fixture.building, FLOOR_RELATION],
          room: [fixture.floor, ROOM_RELATION],
          equipment: [fixture.room, EQUIPMENT_RELATION],
        } as const;
        const [parent, relation] = relations[kind];
        const children = await parent.getChildrenInContext(fixture.context, relation);
        const created = children.find((node) => node.getName().get() === 'New node');
        expect(created).not.to.equal(undefined);
        expect(created!._server_id).to.equal(data.dynamicId);
        expect(created!.getType().get()).to.equal({
          building: fixture.building, floor: fixture.floor, room: fixture.room, equipment: fixture.equipment,
        }[kind].getType().get());
      });

      if (kind === 'floor') {
        it('keeps an attribute linked to info.name when the name is patched', async () => {
          const response = await request(fixture.app)
            .post('/api/v2/floor')
            .send({
              info: { name: 'Floor Name 3', color: '#FF0000', icon: 'floor-icon' },
              attributes: {
                Spatial: {
                  area: '20',
                  name: { $modelRef: 'self', path: 'info.name' },
                },
              },
            })
            .expect(201);

          const created = await fixture.middleware.load<
            import('spinal-model-graph').SpinalNode
          >(response.body.data.dynamicId, fixture.profileId);
          const [spatialCategory] = await created.getChildren(
            NODE_TO_CATEGORY_RELATION
          );
          const attributes = await spatialCategory.getElement(true);
          const linkedName = [...attributes].find(
            (attribute) => attribute.label.get() === 'name'
          );
          expect(linkedName.value).to.equal(created.info.name);

          require('../../src/routes/v2/node/patchNodeById')(
            null,
            fixture.app,
            fixture.middleware
          );
          await request(fixture.app)
            .patch(`/api/v2/node/${created._server_id}`)
            .send({ info: { set: { name: 'Floor 3' } } })
            .expect(200);

          expect(created.info.name.get()).to.equal('Floor 3');
          expect(linkedName.value.get()).to.equal('Floor 3');
        });
      }

      it('applies default attributes when omitted', async () => {
        if (kind === 'building') await fixture.removeBuilding();
        const response = await request(fixture.app).post(`/api/v2/${kind}`).send(body(kind)).expect(201);
        if (kind === 'equipment') {
          expect(response.body.data).not.to.have.property('attributes');
        } else {
          expect(response.body.data.attributes.Spatial.area).to.equal('0');
          if (kind === 'building') {
            expect(response.body.data.attributes['Spinal Building Information'].Adresse).to.equal('To configure');
          }
        }
      });

      it('rejects duplicate names without adding another child', async () => {
        const existing = fixture[kind];
        const response = await request(fixture.app).post(`/api/v2/${kind}`)
          .send(body(kind, existing.getName().get())).expect(409);
        expect(response.body.errorType).to.equal('CONFLICT');
        if (kind === 'room') {
          expect(response.body.message).to.equal('A room with the same name already exists');
        }
      });

      it('rejects invalid info and attribute values before graph access', async () => {
        const before = fixture.graphReads;
        for (const info of [
          {}, { name: '' }, { name: 'x'.repeat(201) }, { name: 'x', color: 'red' },
          { name: 'x', icon: '' }, { name: 'x', custom: null },
          { name: 'x', custom: { invalid: null } },
          { name: 'x', _custom: 'invalid' },
          { name: 'x', custom: { _nested: 'invalid' } },
          { name: 'x', custom: [{ _nested: 'invalid' }] },
        ]) {
          await request(fixture.app).post(`/api/v2/${kind}`)
            .send({ ...body(kind), info }).expect(400);
        }
        for (const attributes of [
          { Custom: { invalid: 12 } }, { Spatial: { area: 12 } }, { Custom: [] },
        ]) {
          await request(fixture.app).post(`/api/v2/${kind}`)
            .send({ ...body(kind), attributes }).expect(400);
        }
        expect(fixture.graphReads).to.equal(before);
      });

      it('rejects caller-supplied node IDs and type', async () => {
        const before = fixture.graphReads;
        for (const key of ['id', 'staticId', 'dynamicId', 'type']) {
          await request(fixture.app).post(`/api/v2/${kind}`).send({
            ...body(kind), info: { name: 'New', [key]: key === 'dynamicId' ? 1 : 'override' },
          }).expect(400);
        }
        expect(fixture.graphReads).to.equal(before);
      });
    });
  }

  for (const kind of ['floor', 'room', 'equipment'] as const) {
    it(`reports a missing building when creating ${kind}`, async () => {
      await fixture.removeBuilding();
      const response = await request(fixture.app).post(`/api/v2/${kind}`)
        .send(body(kind)).expect(400);
      expect(response.body).to.deep.equal({
        errorType: 'ERROR_DATABASE',
        message: 'No building found in database',
      });
    });

    it(`validates linkToGroups for ${kind}`, async () => {
      for (const linkToGroups of [
        [{ contextDynamicId: 0, groupDynamicId: 1 }],
        [{ contextDynamicId: 1 }],
        [{ contextDynamicId: 1, groupDynamicId: 2, unknown: true }],
      ]) {
        await request(fixture.app).post(`/api/v2/${kind}`)
          .send({ ...body(kind), linkToGroups }).expect(400);
      }
      expect(fixture.graphReads).to.equal(0);
    });

    it(`keeps the created ${kind} and reports group-link errors`, async () => {
      const response = await request(fixture.app).post(`/api/v2/${kind}`).send({
        ...body(kind), linkToGroups: [{ contextDynamicId: 123456, groupDynamicId: 123457 }],
      }).expect(201);
      expect(response.body.data.info.name).to.equal('New node');
      expect(response.body.error).to.have.length(1);
      expect(response.body.error[0].errorType).to.equal('INVALID_LOAD_NODE_TYPE');
    });
  }

  it('rejects missing and invalid parent IDs before creating rooms or equipment', async () => {
    for (const [kind, key] of [['room', 'dynamicFloorId'], ['equipment', 'parentDynamicId']] as const) {
      for (const id of [undefined, 0, -1, 'not-a-number']) {
        await request(fixture.app).post(`/api/v2/${kind}`)
          .send({ info: { name: 'New' }, [key]: id }).expect(400);
      }
    }
    expect(fixture.graphReads).to.equal(0);
  });

  it('rejects unknown room parents as a client error', async () => {
    const response = await request(fixture.app).post('/api/v2/room')
      .send({ info: { name: 'New' }, dynamicFloorId: 9999999 }).expect(400);
    expect(response.body.errorType).to.equal('INVALID_LOAD_NODE_TYPE');
  });

  it('rejects room creation under a non-floor parent as a client error', async () => {
    const response = await request(fixture.app).post('/api/v2/room')
      .send({ info: { name: 'New' }, dynamicFloorId: fixture.room._server_id }).expect(400);
    expect(response.body.errorType).to.equal('INVALID_LOAD_NODE_TYPE');
  });

  it('rejects equipment under a floor unless it is a reference object', async () => {
    const response = await request(fixture.app).post('/api/v2/equipment')
      .send({ info: { name: 'New' }, parentDynamicId: fixture.floor._server_id }).expect(400);
    expect(response.body.errorType).to.equal('INVALID_LOAD_NODE_TYPE');
  });

  for (const [parent, relation] of [['room', REFERENCE_ROOM_RELATION], ['floor', REFERENCE_RELATION]] as const) {
    it(`creates reference equipment under a ${parent}`, async () => {
      const response = await request(fixture.app).post('/api/v2/equipment').send({
        parentDynamicId: fixture[parent]._server_id,
        isRefObject: true,
        info: { name: 'Reference', dbid: '123', externalId: 'ext-1' },
      }).expect(201);
      expect(response.body.data.info).to.include({ dbid: 123, externalId: 'ext-1' });
      const nodes = await fixture[parent].getChildren(relation);
      expect(nodes.map((node) => node.getName().get())).to.include('Reference');
    });
  }

  it('rejects reference equipment under an unsupported parent type', async () => {
    await request(fixture.app).post('/api/v2/equipment').send({
      parentDynamicId: fixture.building._server_id, isRefObject: true, info: { name: 'Reference' },
    }).expect(400);
  });
});
