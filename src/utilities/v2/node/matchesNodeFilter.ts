import type { SpinalNode } from 'spinal-model-graph';
import { Bool, Str, Val } from 'spinal-core-connectorjs';
import type { INodeItemAttr } from '../../../routes/v2/openApiCompo/schemas/INodeItemAttr';
import {
  type IQueryFilterNode,
  parseFilterNumber,
} from '../requestParse/parseFilterQuery';
import { extractNodeAttr } from './getNodeData';

/**
 * Tests a node against parsed filters, independently of response projections.
 * staticId maps to info.id; dynamicId and server_id map to _server_id.
 * Missing/undefined values match only exists=false, never ne.
 * Empty strings, false and 0 exist. Graph read errors propagate.
 */
export async function matchesNodeFilter(
  node: SpinalNode,
  filters: readonly IQueryFilterNode[]
): Promise<boolean> {
  let attributes: INodeItemAttr | undefined;
  let attributesLoaded = false;
  for (const filter of filters) {
    const [root, category, attribute] = filter.field.split('.');
    let value: unknown;
    if (root === 'dynamicId' || root === 'server_id') {
      value = node._server_id;
    } else if (root === 'info') {
      const key = category === 'staticId' ? 'id' : category;
      const model = node.info._attribute_names.includes(key) ? node.info[key] : undefined;
      value = model instanceof Str || model instanceof Bool || model instanceof Val
        ? model.get() : undefined;
    } else if (root === 'attributes') {
      if (!attributesLoaded) {
        const query: Record<string, string[]> = Object.create(null);
        for (const condition of filters) {
          const [kind, cat, attr] = condition.field.split('.');
          if (kind !== 'attributes') continue;
          if (!query[cat]) query[cat] = [];
          query[cat].push(attr);
        }
        attributes = await extractNodeAttr(node, query, false);
        attributesLoaded = true;
      }
      const cat = attributes &&
        Object.prototype.hasOwnProperty.call(attributes, category)
        ? attributes[category]
        : undefined;
      value = cat && Object.prototype.hasOwnProperty.call(cat, attribute)
        ? cat[attribute]
        : undefined;
    }
    if (!matchesValue(value, filter)) return false;
  }
  return true;
}

function matchesValue(value: unknown, filter: IQueryFilterNode): boolean {
  if (filter.operator === 'exists') {
    return (value !== undefined) === filter.value;
  }
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    typeof value !== 'boolean'
  ) {
    return false;
  }
  if (filter.operator === 'eq' || filter.operator === 'ne') {
    let expected: string | number | boolean = filter.value;
    if (typeof value === 'number') {
      const number = parseFilterNumber(expected);
      if (number === undefined) return false;
      expected = number;
    } else if (typeof value === 'boolean') {
      if (expected === 'true') expected = true;
      if (expected === 'false') expected = false;
      if (typeof expected !== 'boolean') return false;
    } else {
      expected = String(expected);
    }
    return filter.operator === 'eq' ? value === expected : value !== expected;
  }
  const actual = parseFilterNumber(value);
  const expected = parseFilterNumber(filter.value);
  if (actual === undefined || expected === undefined) return false;
  switch (filter.operator) {
    case 'gt': return actual > expected;
    case 'gte': return actual >= expected;
    case 'lt': return actual < expected;
    case 'lte': return actual <= expected;
  }
}
