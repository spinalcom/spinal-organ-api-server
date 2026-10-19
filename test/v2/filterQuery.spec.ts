import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import { FileSystem, Lst } from 'spinal-core-connectorjs';
import { SpinalNode, SPINAL_RELATION_PTR_LST_TYPE } from 'spinal-model-graph';
import { SpinalAttribute } from 'spinal-models-documentation';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import {
  parseFilterQuery,
  parseOffsetQuery,
} from '../../src/utilities/v2/requestParse/parseFilterQuery';
import { matchesNodeFilter } from '../../src/utilities/v2/node/matchesNodeFilter';
import {
  filterNodes,
  NODE_FILTER_PAGE_SIZE,
} from '../../src/utilities/v2/node/filterNodes';
import { EApiErrorType } from '../../src/utilities/v2/errorHandler/EApiErrorType';
import { getNodeData } from '../../src/utilities/v2/node/getNodeData';

function expectInvalid(action: () => unknown) {
  try {
    action();
  } catch (error) {
    expect(error).to.have.property('errorType', EApiErrorType.INVALID_REQUEST);
    return;
  }
  expect.fail('Expected INVALID_REQUEST');
}

describe('v2 filter query helpers', () => {
  let node: SpinalNode;
  let originalSigServer: boolean;

  before(() => {
    originalSigServer = FileSystem._sig_server;
    FileSystem._sig_server = true;
  });

  after(() => {
    FileSystem._sig_server = originalSigServer;
  });

  beforeEach(() => {
    node = new SpinalNode('Room 001', 'room');
    node._server_id = 123;
    node.info.add_attr({ virtual: false, count: 12, code: '001' });
  });

  describe('parsing', () => {
    it('parses the supplied query examples without losing string values', () => {
      expect(parseFilterQuery({
        filter: {
          'info.type': { eq: 'room' },
          'info.virtual': { eq: 'false' },
          server_id: { gte: '100' },
          'attributes.Geometry.Surface': { gt: '20' },
        },
      })).to.deep.equal([
        { field: 'info.type', operator: 'eq', value: 'room' },
        { field: 'info.virtual', operator: 'eq', value: 'false' },
        { field: 'server_id', operator: 'gte', value: 100 },
        { field: 'attributes.Geometry.Surface', operator: 'gt', value: 20 },
      ]);
      expect(parseFilterQuery({})).to.deep.equal([]);
      expect(parseFilterQuery({ filter: {} })).to.deep.equal([]);
    });

    it('normalizes object, per-field JSON and whole-filter JSON identically', () => {
      const filter = {
        'info.virtual': { eq: 'false' },
        'attributes.Geometry.Surface': { exists: 'true', gte: '20' },
        'info.code': { eq: '001' },
      };
      const expected = parseFilterQuery({ filter });
      const perField = Object.fromEntries(
        Object.entries(filter).map(([field, conditions]) => [field, JSON.stringify(conditions)])
      );
      for (const input of [filter, perField, JSON.stringify(filter), JSON.stringify(perField)]) {
        expect(parseFilterQuery({ filter: input })).to.deep.equal(expected);
      }
      expect(parseFilterQuery({ filter: '{}' })).to.deep.equal([]);
    });

    it('defaults scalar fields to eq while preserving their values', () => {
      for (const value of [
        'room', '001', '', 'false', 'true', '42', 'null', 'undefined', '"string"',
        false, true, 0, 42,
      ]) {
        for (const filter of [
          { 'info.code': value },
          JSON.stringify({ 'info.code': value }),
        ]) {
          expect(parseFilterQuery({ filter })).to.deep.equal([
            { field: 'info.code', operator: 'eq', value },
          ]);
        }
      }
      expect(parseFilterQuery({
        filter: { 'info.code': { eq: '{"literal":true}' } },
      })).to.deep.equal([
        { field: 'info.code', operator: 'eq', value: '{"literal":true}' },
      ]);
      for (const value of [null, undefined, [], Infinity, NaN]) {
        expectInvalid(() => parseFilterQuery({ filter: { 'info.code': value } }));
      }
    });

    it('rejects malformed JSON and invalid objects/operators after decoding', () => {
      for (const filter of [
        '{', 'null', '[]', 'true', '42', '"string"',
        '{"info.virtual":null}',
        '{"info.virtual":[]}',
        '{"info.virtual":{}}',
        '{"info.virtual":{"unknown":"false"}}',
        '{"info.virtual":{"eq":["false"]}}',
        '{"info.virtual":{"eq":{"value":false}}}',
        '{"info.virtual":{"exists":"undefined"}}',
        '{"info.virtual":{"gt":"abc"}}',
        '{"__proto__":{"eq":"x"}}',
        '{"info.constructor":{"eq":"x"}}',
        { 'info.virtual': '{' },
        { 'info.virtual': '[]' },
        { 'info.virtual': '{}' },
        { 'info.virtual': '{"constructor":"x"}' },
        { 'info.virtual': '{"eq":["false"]}' },
        { 'info.virtual': '{"exists":"undefined"}' },
        { 'info.virtual': '{"eq":false}', 'info.type': { eq: ['room'] } },
      ]) {
        expectInvalid(() => parseFilterQuery({ filter }));
      }
    });

    it('parses existence checks as booleans and rejects ambiguous values', () => {
      for (const value of [true, false, 'true', 'false']) {
        expect(parseFilterQuery({
          filter: { 'attributes.Geometry.Surface': { exists: value } },
        })).to.deep.equal([{
          field: 'attributes.Geometry.Surface',
          operator: 'exists',
          value: value === true || value === 'true',
        }]);
      }
      for (const value of ['', 'undefined', 'null', 'TRUE', '0', '1', 0, 1, null, undefined, [], {}]) {
        expectInvalid(() => parseFilterQuery({
          filter: { 'info.virtual': { exists: value } },
        }));
      }
    });

    it('rejects malformed fields, operators and values', () => {
      const invalid = [
        null, '', [], 'room',
        { 'info.type': {} },
        { 'info.type': { contains: 'room' } },
        { 'info.type': { eq: ['room', 'floor'] } },
        { 'info.type': { eq: { nested: 'room' } } },
        { 'info.type': { eq: null } },
        { 'info.type': { eq: Infinity } },
        { 'info.count': { gt: '' } },
        { 'info.count': { gt: 'Infinity' } },
        { 'info.count': { gt: '0x10' } },
        { 'info.count': { gt: false } },
        { 'info.count': { gt: 'room' } },
        { 'info': { eq: 'room' } },
        { 'info.name.extra': { eq: 'room' } },
        { 'attributes.Geometry': { eq: '20' } },
        { 'attributes..Surface': { eq: '20' } },
        { 'info.__proto__': { eq: 'room' } },
        { 'unknown': { eq: 'room' } },
      ];
      for (const filter of invalid) {
        expectInvalid(() => parseFilterQuery({ filter }));
      }
      expectInvalid(() => parseFilterQuery({ 'filter[info.type][eq]': 'room' }));
    });

    it('parses offset with strict non-negative integer validation', () => {
      expect(parseOffsetQuery({})).to.equal(0);
      expect(parseOffsetQuery({ offset: '200' })).to.equal(200);
      expect(parseOffsetQuery({ offset: 0 })).to.equal(0);
      for (const offset of [
        null, '', ' ', '-1', -1, 0.5, '1.5', '1e2', 'Infinity',
        Infinity, NaN, true, [], {}, ['1'], Number.MAX_SAFE_INTEGER + 1,
      ]) {
        expectInvalid(() => parseOffsetQuery({ offset }));
      }
    });

    it('handles real Express GET queries and returns projected INodeItem data', async () => {
      const app = express();
      app.set('query parser', 'extended');
      app.get('/nodes', async (req, res, next) => {
        try {
          const filters = parseFilterQuery(req.query);
          const page = await filterNodes([{ node, parentId: 456 }], filters, parseOffsetQuery(req.query));
          const data = await Promise.all(
            page.map(({ node, parentId }) => getNodeData(node, ['name'], false, false, parentId))
          );
          res.json({ data });
        } catch (error) {
          next(error);
        }
      });
      const previousObject = FileSystem._objects[123];
      FileSystem._objects[123] = node;
      try {
        const response = await request(app)
          .get('/nodes')
          .query({
            'filter[info.type][eq]': 'room',
            'filter[info.virtual][eq]': 'false',
            'filter[server_id][gte]': '100',
            'filter[info.virtual][exists]': 'true',
            'filter[attributes.Geometry.Surface][exists]': 'false',
            offset: '0',
          })
          .expect(200);
        expect(response.body).to.deep.equal({
          data: [{ dynamicId: 123, parentDynamicId: 456, info: { name: 'Room 001' } }],
        });
        const emptyPage = await request(app)
          .get('/nodes')
          .query({ 'filter[info.type][eq]': 'room', offset: '1' })
          .expect(200);
        expect(emptyPage.body).to.deep.equal({ data: [] });
      } finally {
        if (previousObject === undefined) delete FileSystem._objects[123];
        else FileSystem._objects[123] = previousObject;
      }
    });
  });

  describe('matching SpinalNode', () => {
    async function matches(filter: Record<string, unknown>) {
      return matchesNodeFilter(node, parseFilterQuery({ filter }));
    }

    it('ANDs predicates and resolves API field names against model values', async () => {
      expect(await matches({
        'info.type': { eq: 'room' },
        'info.virtual': { eq: 'false' },
        'info.staticId': { eq: node.getId().get() },
        dynamicId: { eq: '123' },
        server_id: { gte: '100' },
        'info.count': { gte: '12', lte: '12' },
      })).to.equal(true);
      expect(await matches({ 'info.virtual': { eq: 'true' } })).to.equal(false);
      expect(await matches({
        'info.type': { eq: 'room' },
        'info.count': { lt: '12' },
      })).to.equal(false);
      expect(await matches({})).to.equal(true);
    });

    it('handles equality, inequality, boundaries and numeric strings', async () => {
      expect(await matches({ 'info.code': { eq: '001' } })).to.equal(true);
      expect(await matches({ 'info.code': { eq: '1' } })).to.equal(false);
      expect(await matches({ 'info.type': { ne: 'floor' } })).to.equal(true);
      expect(await matches({ 'info.type': { ne: 'room' } })).to.equal(false);
      expect(await matches({ 'info.count': { gt: '11', lt: '13' } })).to.equal(true);
      expect(await matches({ 'info.count': { gt: '12' } })).to.equal(false);
      expect(await matches({ 'info.count': { lte: '11' } })).to.equal(false);
      expect(await matches({ 'info.count': { gte: '13' } })).to.equal(false);
      expect(await matches({ 'info.count': { eq: '1.2e1' } })).to.equal(true);
      expect(await matches({ 'info.count': { eq: '' } })).to.equal(false);
      expect(await matches({ 'info.virtual': { eq: '0' } })).to.equal(false);
      expect(await matches({ 'info.virtual': { gt: '0' } })).to.equal(false);
      expect(await matches({ 'info.type': { gt: '0' } })).to.equal(false);
    });

    it('never matches missing or non-scalar fields, including ne', async () => {
      expect(await matches({ 'info.missing': { ne: 'x' } })).to.equal(false);
      expect(await matches({ 'info.missing': { eq: '' } })).to.equal(false);
      node.info.add_attr('nested', { value: 'x' });
      expect(await matches({ 'info.nested': { ne: 'x' } })).to.equal(false);
      expect(await matches({ 'info.toString': { ne: 'x' } })).to.equal(false);
    });

    it('checks existence without confusing falsy values or literal undefined strings', async () => {
      node.info.add_attr({ empty: '', zero: 0, literal: 'undefined' });
      for (const field of [
        'info.empty', 'info.zero', 'info.virtual', 'info.literal',
        'info.staticId', 'dynamicId', 'server_id',
      ]) {
        expect(await matches({ [field]: { exists: 'true' } }), field).to.equal(true);
        expect(await matches({ [field]: { exists: 'false' } }), field).to.equal(false);
      }
      expect(await matches({ 'info.missing': { exists: 'false' } })).to.equal(true);
      expect(await matches({ 'info.missing': { exists: 'true' } })).to.equal(false);
      expect(await matches({ 'info.toString': { exists: 'false' } })).to.equal(true);
      node.info.add_attr('nested', { value: 'x' });
      expect(await matches({ 'info.nested': { exists: 'false' } })).to.equal(true);
      node._server_id = undefined;
      expect(await matches({ dynamicId: { exists: 'false' } })).to.equal(true);
      expect(await matches({ server_id: { exists: 'true' } })).to.equal(false);
      expect(await matches({
        'info.missing': { exists: 'false', ne: 'x' },
      })).to.equal(false);
    });

    it('checks attribute existence including empty values and missing categories', async () => {
      const attributes = new Lst<SpinalAttribute>();
      attributes.push(new SpinalAttribute('Empty', ''));
      attributes.push(new SpinalAttribute('Literal', 'undefined'));
      const category = new SpinalNode('Geometry', 'category', attributes);
      await node.addChild(category, NODE_TO_CATEGORY_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
      for (const name of ['Empty', 'Literal']) {
        const field = `attributes.Geometry.${name}`;
        expect(await matches({ [field]: { exists: 'true' } })).to.equal(true);
        expect(await matches({ [field]: { exists: 'false' } })).to.equal(false);
      }
      for (const field of ['attributes.Geometry.Missing', 'attributes.Missing.Surface']) {
        expect(await matches({ [field]: { exists: 'false' } })).to.equal(true);
        expect(await matches({ [field]: { exists: 'true' } })).to.equal(false);
      }
      expect(await matches({
        'info.type': { eq: 'room' },
        'attributes.Geometry.Empty': { exists: 'true', eq: '' },
        'attributes.Geometry.Missing': { exists: 'false' },
      })).to.equal(true);
    });

    it('reads categorized attribute values without projecting them into the output', async () => {
      const attributes = new Lst<SpinalAttribute>();
      attributes.push(new SpinalAttribute('Surface', '25'));
      attributes.push(new SpinalAttribute('Code', '001'));
      const category = new SpinalNode('Geometry', 'category', attributes);
      await node.addChild(
        category,
        NODE_TO_CATEGORY_RELATION,
        SPINAL_RELATION_PTR_LST_TYPE
      );
      expect(await matches({
        'attributes.Geometry.Surface': { gt: '20', lte: '25' },
        'attributes.Geometry.Code': { eq: '001' },
      })).to.equal(true);
      expect(await matches({
        'attributes.Geometry.Surface': { lt: '25' },
      })).to.equal(false);
      expect(await matches({
        'attributes.Missing.Surface': { ne: '0' },
      })).to.equal(false);
      expect(await matches({
        'attributes.Geometry.Missing': { ne: '0' },
      })).to.equal(false);
    });

    it('does not read attributes after an earlier predicate fails', async () => {
      node.getChildren = async () => { throw new Error('graph read failed'); };
      expect(await matches({
        'info.type': { eq: 'floor' },
        'attributes.Geometry.Surface': { gt: '20' },
      })).to.equal(false);
      try {
        await matches({ 'attributes.Geometry.Surface': { gt: '20' } });
        expect.fail('Expected graph read failure');
      } catch (error) {
        expect(error).to.have.property('message', 'graph read failed');
      }
    });
  });

  describe('pagination', () => {
    it('checks batches of 20 concurrently and preserves order across a partial batch', async () => {
      let active = 0;
      let maxActive = 0;
      const completed: number[] = [];
      const batchStarts: number[] = [];
      const nodes = Array.from({ length: 45 }, (_, index) => {
        const item = new SpinalNode(String(index), 'room');
        item.getChildren = async () => {
          if (active === 0) batchStarts.push(index);
          active++;
          maxActive = Math.max(maxActive, active);
          await new Promise<void>((resolve) => {
            setTimeout(resolve, index % 20 === 0 ? 10 : 0);
          });
          active--;
          completed.push(index);
          return [];
        };
        return { node: item, parentId: index + 100 };
      });
      const filters = parseFilterQuery({
        filter: { 'attributes.Geometry.Surface': { exists: false } },
      });
      const page = await filterNodes(nodes, filters, 3);
      expect(page).to.deep.equal(nodes.slice(3));
      expect(maxActive).to.equal(20);
      expect(active).to.equal(0);
      expect(batchStarts).to.deep.equal([0, 20, 40]);
      expect(completed).to.have.length(45);
      expect(completed[0]).not.to.equal(0);
    });

    it('propagates node matching errors from a batch', async () => {
      const broken = new SpinalNode('Broken', 'room');
      broken.getChildren = async () => { throw new Error('batch read failed'); };
      const filters = parseFilterQuery({
        filter: { 'attributes.Geometry.Surface': { exists: true } },
      });
      try {
        await filterNodes([{ node, parentId: 1 }, { node: broken, parentId: 2 }], filters);
        expect.fail('Expected batch read failure');
      } catch (error) {
        expect(error).to.have.property('message', 'batch read failed');
      }
    });

    it('preserves wrapper identity and distinct parents for the same node', async () => {
      const first = { node, parentId: 100 };
      const second = { node, parentId: 200 };
      const page = await filterNodes([first, second], []);
      expect(page[0]).to.equal(first);
      expect(page[1]).to.equal(second);
      expect(await filterNodes([first, second], [], 1)).to.deep.equal([second]);
    });

    it('returns exactly 200 items and stops reading when the page is full', async () => {
      let visited = 0;
      function* nodes() {
        for (let index = 0; index < 500; index++) {
          visited++;
          yield { node, parentId: index };
        }
      }
      expect(NODE_FILTER_PAGE_SIZE).to.equal(200);
      expect(await filterNodes(nodes(), [])).to.have.length(200);
      expect(visited).to.equal(200);
    });

    it('caps the page even when it fills partway through a batch', async () => {
      let visited = 0;
      function* nodes() {
        for (let index = 0; index < 500; index++) {
          visited++;
          yield { node, parentId: index };
        }
      }
      expect(await filterNodes(nodes(), [], 1)).to.have.length(200);
      expect(visited).to.equal(220);
    });

    it('applies offset after filtering, preserving order', async () => {
      const nodes = Array.from({ length: 405 }, (_, index) => {
        const item = new SpinalNode(String(index), index % 2 ? 'floor' : 'room');
        return { node: item, parentId: index + 100 };
      });
      const filters = parseFilterQuery({ filter: { 'info.type': { eq: 'room' } } });
      const firstPage = await filterNodes(nodes, filters);
      const lastPage = await filterNodes(nodes, filters, 200);
      expect(firstPage).to.deep.equal(nodes.filter((_, i) => i % 2 === 0).slice(0, 200));
      expect(lastPage).to.deep.equal([nodes[400], nodes[402], nodes[404]]);
      expect(await filterNodes(nodes, filters, 203)).to.deep.equal([]);
      expect(await filterNodes([], [])).to.deep.equal([]);
    });

    it('accepts asynchronous sources and propagates source errors', async () => {
      const item = { node, parentId: 456 };
      async function* nodes() { yield item; }
      expect(await filterNodes(nodes(), [])).to.deep.equal([item]);
      async function* broken() {
        yield item;
        throw new Error('source failed');
      }
      try {
        await filterNodes(broken(), []);
        expect.fail('Expected source failure');
      } catch (error) {
        expect(error).to.have.property('message', 'source failed');
      }
    });
  });
});
