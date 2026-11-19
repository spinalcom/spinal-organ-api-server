import { expect } from 'chai';
import { Bool, Str, Val } from 'spinal-core-connectorjs';
import { SpinalContext, SPINAL_RELATION_PTR_LST_TYPE, SPINAL_RELATION_TYPE } from 'spinal-model-graph';
import {
  FLOOR_TYPE, ROOM_TYPE, ROOM_RELATION, BUILDING_RELATION,
  SITE_RELATION, SITE_TYPE,
} from 'spinal-env-viewer-context-geographic-service';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { groupManagerService } from 'spinal-env-viewer-plugin-group-manager-service';
import { setOrCreateInfo } from '../../src/utilities/v2/node/setOrCreateInfo';
import { handleSetInfo } from '../../src/utilities/v2/node/handleSetInfo';
import { handleSetAttribute } from '../../src/utilities/v2/node/handleSetAttribute';
import { getNodeData, extractNodeInfo, extractNodeAttr } from '../../src/utilities/v2/node/getNodeData';
import { getNodeChildrenFromParentDynId } from '../../src/utilities/v2/node/getNodeChildrenFromParentDynId';
import { getBuildingNode } from '../../src/utilities/v2/geographicContext/getBuilding';
import { getRoomInContextIterable } from '../../src/utilities/v2/geographicContext/getRoomInContextIterable';
import { getEquipmentInContextIterable } from '../../src/utilities/v2/geographicContext/getEquipmentInContextIterable';
import { linkNodeToGroups } from '../../src/utilities/v2/node/linkNodeToGroups';
import { createSpatialFixture, type SpatialFixture } from './helpers/spatialFixture';

describe('v2 node and geographic utilities', () => {
  let fixture: SpatialFixture;
  beforeEach(async () => { fixture = await createSpatialFixture(); });
  afterEach(() => { fixture.cleanup(); });

  it('creates correctly typed info and updates models without replacing matching types', () => {
    const node = fixture.room;
    for (const [key, value, type] of [
      ['text', 'initial', Str], ['number', 12, Val], ['boolean', false, Bool],
    ] as const) {
      setOrCreateInfo(node, key, value);
      expect(node.info[key]).to.be.instanceOf(type);
      const original = node.info[key];
      setOrCreateInfo(node, key, value);
      expect(node.info[key]).to.equal(original);
    }
    const original = node.info.text;
    setOrCreateInfo(node, 'text', 'updated');
    expect(node.info.text).to.equal(original);
    expect(node.info.text.get()).to.equal('updated');
    setOrCreateInfo(node, 'text', 42);
    expect(node.info.text).to.be.instanceOf(Val);
    expect(node.info.text.get()).to.equal(42);
    setOrCreateInfo(node, 'text', false);
    expect(node.info.text).to.be.instanceOf(Bool);
    expect(node.info.text.get()).to.equal(false);
    setOrCreateInfo(node, 'missing', undefined);
    expect(node.info.missing).to.equal(undefined);
  });

  it('sets only own defined info properties and maps staticId to id', async () => {
    const info = Object.assign(Object.create({ inherited: 'ignored' }), {
      staticId: 'new-id', name: 'New name', absent: undefined, flag: false, zero: 0,
    });
    await handleSetInfo(fixture.room, undefined);
    await handleSetInfo(fixture.room, info);
    expect(extractNodeInfo(true, fixture.room)).to.include({
      staticId: 'new-id', name: 'New name', flag: false, zero: 0,
    });
    expect(fixture.room.info.inherited).to.equal(undefined);
    expect(fixture.room.info.absent).to.equal(undefined);
  });

  it('merges default attributes without overriding requested values and updates existing attributes', async () => {
    const node = fixture.room;
    await handleSetAttribute(node, { Spatial: { area: '42' }, Custom: { code: '001' } }, {
      Spatial: { area: '0', category: 'room' }, Default: { value: 'default' },
    });
    expect(await extractNodeAttr(node, true, false)).to.deep.equal({
      Spatial: { area: '42', category: 'room' }, Custom: { code: '001' }, Default: { value: 'default' },
    });
    await handleSetAttribute(node, { Spatial: { area: '99' } });
    expect(await extractNodeAttr(node, { Spatial: ['area'] }, false)).to.deep.equal({ Spatial: { area: '99' } });
    await handleSetAttribute(node);
    expect(await extractNodeAttr(node, { Spatial: ['area'] }, false)).to.deep.equal({ Spatial: { area: '99' } });
  });

  it('extracts structured info, supports projections and maps staticId', () => {
    const node = fixture.room;
    node.info.add_attr({ nested: { invalid: true }, empty: '', flag: false, number: 0 });
    expect(extractNodeInfo(true, node)).to.include({
      staticId: node.getId().get(), empty: '', flag: false, number: 0,
    }).and.to.have.deep.property('nested', { invalid: true });
    expect(extractNodeInfo(['name', 'missing'], node)).to.deep.equal({ name: 'Room' });
    expect(extractNodeInfo([], node)).to.equal(undefined);
    expect(extractNodeInfo(['missing', 'nested'], node)).to.deep.equal({ nested: { invalid: true } });
  });

  it('selects categories/attributes, omits excluded or missing values and includes dates', async () => {
    const node = fixture.room;
    await attributeService.createOrUpdateAttrsAndCategories(node, 'Geometry', { Surface: '25', Code: '001' });
    expect(await extractNodeAttr(node, false, false)).to.equal(undefined);
    expect(await extractNodeAttr(node, undefined, false)).to.equal(undefined);
    expect(await extractNodeAttr(node, { Geometry: false }, false)).to.equal(undefined);
    expect(await extractNodeAttr(node, { Missing: true }, false)).to.equal(undefined);
    expect(await extractNodeAttr(node, { Geometry: ['Missing'] }, false)).to.equal(undefined);
    expect(await extractNodeAttr(node, { Geometry: ['Code'] }, false)).to.deep.equal({ Geometry: { Code: '001' } });
    const attrs = await extractNodeAttr(node, { Geometry: true }, true);
    expect(attrs!.Geometry).to.have.keys('Surface', 'Code');
    expect(attrs!.Geometry.Surface).to.have.property('value', '25');
    expect(attrs!.Geometry.Surface).to.have.property('lastModification').that.is.a('number');
  });

  it('formats INodeItem with dynamic and parent IDs without unwanted output fields', async () => {
    const data = await getNodeData(fixture.room, ['name'], false, false, fixture.floor._server_id);
    expect(JSON.parse(JSON.stringify(data))).to.deep.equal({
      dynamicId: fixture.room._server_id, parentDynamicId: fixture.floor._server_id, info: { name: 'Room' },
    });
  });

  it('returns only correctly typed parent children within the specified context', async () => {
    const wrong = fixture.node('Wrong type', FLOOR_TYPE);
    await fixture.link(fixture.floor, wrong, ROOM_RELATION);
    const children = await getNodeChildrenFromParentDynId(
      fixture.middleware, fixture.floor._server_id!, fixture.profileId, ROOM_TYPE,
      [{ relationName: ROOM_RELATION, parentType: FLOOR_TYPE, context: fixture.context }]
    );
    expect(children).to.deep.equal([fixture.room]);
  });

  it('supports group children without context and ignores incompatible parents', async () => {
    const group = fixture.node('Group', `${ROOM_TYPE}Group`);
    const relation = `groupHas${ROOM_TYPE}`;
    await group.addChild(fixture.room, relation, SPINAL_RELATION_PTR_LST_TYPE);
    const relations = [{ relationName: relation, parentType: `${ROOM_TYPE}Group` }];
    expect(await getNodeChildrenFromParentDynId(
      fixture.middleware, group._server_id!, fixture.profileId, ROOM_TYPE, relations
    )).to.deep.equal([fixture.room]);
    expect(await getNodeChildrenFromParentDynId(
      fixture.middleware, fixture.floor._server_id!, fixture.profileId, ROOM_TYPE, relations
    )).to.deep.equal([]);
  });

  it('finds the existing building without creating another one', async () => {
    const found = await getBuildingNode(fixture.middleware, fixture.profileId);
    expect(found.geographicContext).to.equal(fixture.context);
    expect(found.building).to.equal(fixture.building);
  });

  it('reports no building when the context is empty', async () => {
    await fixture.removeBuilding();
    const found = await getBuildingNode(fixture.middleware, fixture.profileId);
    expect(found.building).to.equal(undefined);
  });

  it('finds buildings through a site', async () => {
    await fixture.removeBuilding();
    const site = fixture.node('Site', SITE_TYPE);
    await fixture.link(fixture.context, site, SITE_RELATION);
    await fixture.link(site, fixture.building, BUILDING_RELATION);
    expect((await getBuildingNode(fixture.middleware, fixture.profileId)).building).to.equal(fixture.building);
  });

  it('rejects a missing spatial context when creation is disabled', async () => {
    await fixture.graph.removeChild(fixture.context, 'hasContext', SPINAL_RELATION_TYPE);
    try {
      await getBuildingNode(fixture.middleware, fixture.profileId, false);
      expect.fail('Expected a missing context error');
    } catch (error) {
      expect(error).to.have.property('errorType', 'ERROR_DATABASE');
    }
  });

  it('creates a missing spatial context when explicitly requested', async () => {
    await fixture.graph.removeChild(fixture.context, 'hasContext', SPINAL_RELATION_TYPE);
    const found = await getBuildingNode(fixture.middleware, fixture.profileId, true);
    expect(found.geographicContext.getName().get()).to.equal('spatial');
    expect(found.geographicContext).not.to.equal(fixture.context);
    expect(found.building).to.equal(undefined);
    expect(await fixture.graph.getContext('spatial')).to.equal(found.geographicContext);
  });

  it('propagates attribute read errors rather than returning success-shaped data', async () => {
    fixture.room.getChildren = async () => { throw new Error('attribute read failed'); };
    try {
      await extractNodeAttr(fixture.room, true, false);
      expect.fail('Expected attribute read failure');
    } catch (error) {
      expect(error).to.have.property('message', 'attribute read failed');
    }
  });

  it('propagates iterator graph read errors', async () => {
    fixture.building.getChildrenInContext = async () => { throw new Error('graph read failed'); };
    for (const iterable of [
      getRoomInContextIterable(fixture.context, fixture.building),
      getEquipmentInContextIterable(fixture.context, fixture.building, 'bimobject'),
    ]) {
      try {
        for await (const _item of iterable) {
          expect.fail('No items should be returned after a graph read error');
        }
        expect.fail('Expected graph read failure');
      } catch (error) {
        expect(error).to.have.property('message', 'graph read failed');
      }
    }
  });

  it('iterates rooms and equipment with their actual parent IDs', async () => {
    const rooms = [];
    for await (const item of getRoomInContextIterable(fixture.context, fixture.building)) rooms.push(item);
    expect(rooms).to.deep.equal([{ node: fixture.room, parentId: fixture.floor._server_id }]);
    const equipment = [];
    for await (const item of getEquipmentInContextIterable(fixture.context, fixture.building, 'bimobject')) equipment.push(item);
    expect(equipment).to.deep.equal([{ node: fixture.equipment, parentId: fixture.room._server_id }]);
  });

  it('returns no group errors for an empty list and collects invalid links', async () => {
    expect(await linkNodeToGroups(fixture.middleware, fixture.profileId, fixture.room, []))
      .to.deep.equal({ success: [], errors: [] });
    const result = await linkNodeToGroups(fixture.middleware, fixture.profileId, fixture.room, [
      { contextDynamicId: 999999, groupDynamicId: 999998 },
      { contextDynamicId: fixture.floor._server_id!, groupDynamicId: fixture.room._server_id! },
    ]);
    expect(result.success).to.deep.equal([]);
    expect(result.errors).to.have.length(2);
    expect(result.errors.every((error) => error.errorType === 'INVALID_LOAD_NODE_TYPE')).to.equal(true);
  });

  it('loads distinct context and group IDs when linking a valid group', async () => {
    const context = new SpinalContext('Room groups', `${ROOM_TYPE}GroupContext`);
    fixture.register(context);
    const group = fixture.node('Room group', `${ROOM_TYPE}Group`);
    const originalLink = groupManagerService.linkElementToGroup;
    const calls: string[][] = [];
    groupManagerService.linkElementToGroup = async (...ids: [string, string, string]) => {
      calls.push(ids);
      return { old_group: undefined, newGroup: ids[1] };
    };
    try {
      const link = { contextDynamicId: context._server_id!, groupDynamicId: group._server_id! };
      const result = await linkNodeToGroups(fixture.middleware, fixture.profileId, fixture.room, [link]);
      expect(fixture.loads).to.deep.equal([context._server_id, group._server_id]);
      expect(calls).to.deep.equal([[context.getId().get(), group.getId().get(), fixture.room.getId().get()]]);
      expect(result).to.deep.equal({ success: [link], errors: [] });
    } finally {
      groupManagerService.linkElementToGroup = originalLink;
    }
  });
});
