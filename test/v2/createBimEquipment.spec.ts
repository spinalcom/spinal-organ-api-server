import { expect } from 'chai';
import request from 'supertest';
import { SpinalContext } from 'spinal-model-graph';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import {
  EQUIPMENT_RELATION,
  REFERENCE_RELATION,
  ROOM_RELATION,
  ROOM_TYPE,
} from 'spinal-env-viewer-context-geographic-service';
import {
  createSpatialFixture,
  type SpatialFixture,
} from './helpers/spatialFixture';

describe('v2 equipment BIM reuse', () => {
  let fixture: SpatialFixture;
  beforeEach(async () => {
    fixture = await createSpatialFixture();
  });
  afterEach(() => fixture.cleanup());
  async function bimFile() {
    const context = new SpinalContext('BimFileContext', 'context');
    fixture.register(context);
    await fixture.graph.addContext(context);
    const file = fixture.node('Model', 'bimFile');
    await context.addChild(file, 'hasBimFile', 'PtrLst');
    return file;
  }
  function payload(id: string, dbid = 0) {
    return {
      parentDynamicId: fixture.room._server_id,
      info: { name: 'BIM equipment', bimFileId: id, dbid },
    };
  }
  for (const type of ['PtrLst', 'LstPtr']) {
    for (const reference of [false, true]) {
      it(`retains an existing ${type} ${
        reference ? 'reference' : 'geographic'
      } link without adding another type`, async () => {
        const file = await bimFile();
        const context = fixture.node('BIMContext', 'SpinalNode');
        await file.addChild(context, 'hasBimContext', 'PtrLst');
        const existing = fixture.node('Original', 'BIMObject');
        existing.info.add_attr('dbid', 0);
        await context.addChild(existing, EQUIPMENT_RELATION, 'PtrLst');
        const parent = reference ? fixture.floor : fixture.room;
        const relation = reference ? REFERENCE_RELATION : EQUIPMENT_RELATION;
        if (reference) await parent.addChild(existing, relation, type);
        else
          await parent.addChildInContext(
            existing,
            relation,
            type,
            fixture.context
          );
        const response = await request(fixture.app)
          .post('/api/v2/equipment')
          .send({
            ...payload(file.getId().get()),
            parentDynamicId: parent._server_id,
            isRefObject: reference,
          })
          .expect(201);
        expect(response.body.data.dynamicId).to.equal(existing._server_id);
        const otherType = type === 'PtrLst' ? 'LstPtr' : 'PtrLst';
        const other = parent.children
          .getElement(otherType)
          ?.getElement(relation);
        expect(
          other?.getChildrenIds().includes(existing.getId().get()) ?? false
        ).to.equal(false);
        expect(
          (await parent.getChildren(relation)).filter(
            (node) => node === existing
          )
        ).to.have.length(1);
      });
    }
  }
  it('rejects missing BIM files before attachment', async () => {
    const response = await request(fixture.app)
      .post('/api/v2/equipment')
      .send(payload('missing'))
      .expect(400);
    expect(response.body.message).to.equal('bimFileId given but NotFound');
    expect(await fixture.room.getChildren(EQUIPMENT_RELATION)).to.deep.equal([
      fixture.equipment,
    ]);
    await bimFile();
    await request(fixture.app)
      .post('/api/v2/equipment')
      .send(payload('another-missing'))
      .expect(400);
  });
  it('creates BIMContext when absent and attaches new equipment under it', async () => {
    const file = await bimFile();
    const response = await request(fixture.app)
      .post('/api/v2/equipment')
      .send(payload(file.getId().get()))
      .expect(201);
    const [context] = await file.getChildren('hasBimContext');
    expect(context.getName().get()).to.equal('BIMContext');
    expect(context.getType().get()).to.equal('SpinalNode');
    const [equipment] = await context.getChildren(EQUIPMENT_RELATION);
    expect(equipment._server_id).to.equal(response.body.data.dynamicId);
    expect(equipment.info.dbid.get()).to.equal(0);
    expect(equipment.info.virtual.get()).to.equal(false);
    expect(context.hasRelation(EQUIPMENT_RELATION, 'PtrLst')).to.equal(true);
    expect(
      fixture.room.children
        .getElement('PtrLst')
        .getElement(EQUIPMENT_RELATION)
        .getChildrenIds()
    ).to.include(equipment.getId().get());
    expect(await file.getChildren(EQUIPMENT_RELATION)).to.deep.equal([]);
  });
  it('searches multiple BIMContexts and patches only supplied fields, safely repeating attachment', async () => {
    const file = await bimFile();
    const first = fixture.node('First', 'SpinalNode');
    const second = fixture.node('Second', 'SpinalNode');
    await file.addChild(first, 'hasBimContext', 'PtrLst');
    await file.addChild(second, 'hasBimContext', 'PtrLst');
    const unrelated = fixture.node('Unrelated', 'BIMObject');
    await first.addChild(unrelated, EQUIPMENT_RELATION, 'PtrLst');
    const existing = fixture.node('Existing', 'BIMObject');
    existing.info.add_attr({
      dbid: 0,
      virtual: true,
      externalId: 'keep',
      metadata: { keep: true },
    });
    await second.addChild(existing, EQUIPMENT_RELATION, 'PtrLst');
    await attributeService.createOrUpdateAttrsAndCategories(
      existing,
      'Technical',
      { Code: 'old', Keep: 'yes' }
    );
    const name = existing.info.name;
    const body = {
      ...payload(file.getId().get()),
      attributes: { Technical: { Code: 'new' } },
    };
    for (let i = 0; i < 2; i++) {
      const response = await request(fixture.app)
        .post('/api/v2/equipment')
        .send(body)
        .expect(201);
      expect(response.body.data.dynamicId).to.equal(existing._server_id);
      expect(response.body.data.info).to.include({
        virtual: true,
        externalId: 'keep',
      });
      expect(response.body.data.attributes.Technical).to.deep.equal({
        Code: 'new',
        Keep: 'yes',
      });
    }
    expect(existing.info.name).to.equal(name);
    expect(existing.info.metadata.get()).to.deep.equal({ keep: true });
    expect(await second.getChildren(EQUIPMENT_RELATION)).to.deep.equal([
      existing,
    ]);
    expect(await fixture.room.getChildren(EQUIPMENT_RELATION)).to.have.members([
      fixture.equipment,
      existing,
    ]);
    expect(fixture.loads).to.include(existing._server_id);
  });
  it('moves reused equipment from its other spatial parent', async () => {
    const file = await bimFile();
    const context = fixture.node('BIMContext', 'SpinalNode');
    await file.addChild(context, 'hasBimContext', 'PtrLst');
    const existing = fixture.node('Original', 'BIMObject');
    existing.info.add_attr('dbid', 0);
    await context.addChild(existing, EQUIPMENT_RELATION, 'PtrLst');
    await fixture.room.addChildInContext(
      existing,
      EQUIPMENT_RELATION,
      'PtrLst',
      fixture.context
    );
    const destination = fixture.node('Other Room', ROOM_TYPE);
    await fixture.floor.addChildInContext(
      destination,
      ROOM_RELATION,
      'PtrLst',
      fixture.context
    );

    const response = await request(fixture.app)
      .post('/api/v2/equipment')
      .send({
        ...payload(file.getId().get()),
        parentDynamicId: destination._server_id,
      })
      .expect(201);

    expect(response.body.data.dynamicId).to.equal(existing._server_id);
    expect(await fixture.room.getChildren(EQUIPMENT_RELATION)).to.deep.equal([
      fixture.equipment,
    ]);
    expect(await destination.getChildren(EQUIPMENT_RELATION)).to.deep.equal([
      existing,
    ]);
    expect(await context.getChildren(EQUIPMENT_RELATION)).to.deep.equal([
      existing,
    ]);
  });
  it('creates a missing dbid under an existing BIMContext', async () => {
    const file = await bimFile();
    const context = fixture.node('BIMContext', 'SpinalNode');
    await file.addChild(context, 'hasBimContext', 'PtrLst');
    await request(fixture.app)
      .post('/api/v2/equipment')
      .send(payload(file.getId().get(), 45))
      .expect(201);
    expect(await file.getChildren('hasBimContext')).to.deep.equal([context]);
    expect(
      (await context.getChildren(EQUIPMENT_RELATION))[0].info.dbid.get()
    ).to.equal(45);
  });
  it('does not patch an existing BIM object on duplicate-name or access failure', async () => {
    const file = await bimFile();
    const context = fixture.node('BIMContext', 'SpinalNode');
    await file.addChild(context, 'hasBimContext', 'PtrLst');
    const existing = fixture.node('Original', 'BIMObject');
    existing.info.add_attr('dbid', 0);
    await context.addChild(existing, EQUIPMENT_RELATION, 'PtrLst');
    const body = payload(file.getId().get());
    body.info.name = fixture.equipment.getName().get();
    await request(fixture.app).post('/api/v2/equipment').send(body).expect(409);
    expect(existing.getName().get()).to.equal('Original');
    const original = fixture.middleware.load.bind(fixture.middleware);
    fixture.middleware.load = async (id, profile) => {
      if (id === existing._server_id) throw new Error('Denied');
      return original(id, profile);
    };
    await request(fixture.app)
      .post('/api/v2/equipment')
      .send(payload(file.getId().get()))
      .expect(400);
    expect(existing.getName().get()).to.equal('Original');
  });
  it('does not search the graph when either identifier is omitted', async () => {
    fixture.middleware.getGraph = async () => {
      throw new Error('Must not search BIM');
    };
    for (const info of [
      { name: 'Only dbid', dbid: 0 },
      { name: 'Only file', bimFileId: 'unresolved' },
    ])
      await request(fixture.app)
        .post('/api/v2/equipment')
        .send({
          parentDynamicId: fixture.room._server_id,
          info,
        })
        .expect(201);
  });

  it('reuses objects as floor references and resolves self refs against patched fields', async () => {
    const file = await bimFile();
    const context = fixture.node('BIMContext', 'SpinalNode');
    await file.addChild(context, 'hasBimContext', 'PtrLst');
    const existing = fixture.node('Original', 'BIMObject');
    existing.info.add_attr({ dbid: 0, virtual: true });
    await context.addChild(existing, EQUIPMENT_RELATION, 'PtrLst');
    const response = await request(fixture.app)
      .post('/api/v2/equipment')
      .send({
        ...payload(file.getId().get()),
        parentDynamicId: fixture.floor._server_id,
        isRefObject: true,
        info: {
          ...payload(file.getId().get()).info,
          virtual: false,
          alias: { $modelRef: 'self', path: 'info.name' },
        },
      })
      .expect(201);
    expect(response.body.data.dynamicId).to.equal(existing._server_id);
    expect(existing.info.alias).to.equal(existing.info.name);
    expect(existing.info.virtual.get()).to.equal(false);
    expect(await fixture.floor.getChildren(REFERENCE_RELATION)).to.deep.equal([
      existing,
    ]);
    expect(await context.getChildren(EQUIPMENT_RELATION)).to.deep.equal([
      existing,
    ]);
  });

  it('does not attach or mutate existing objects when patch reference validation fails', async () => {
    const file = await bimFile();
    const context = fixture.node('BIMContext', 'SpinalNode');
    await file.addChild(context, 'hasBimContext', 'PtrLst');
    const existing = fixture.node('Original', 'BIMObject');
    existing.info.add_attr('dbid', 0);
    await context.addChild(existing, EQUIPMENT_RELATION, 'PtrLst');
    await request(fixture.app)
      .post('/api/v2/equipment')
      .send({
        ...payload(file.getId().get()),
        info: {
          ...payload(file.getId().get()).info,
          alias: { $modelRef: 'self', path: 'info.missing' },
        },
      })
      .expect(400);
    expect(existing.getName().get()).to.equal('Original');
    expect(await fixture.room.getChildren(EQUIPMENT_RELATION)).to.deep.equal([
      fixture.equipment,
    ]);
  });
});
