"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesNodeFilter = matchesNodeFilter;
const parseFilterQuery_1 = require("../requestParse/parseFilterQuery");
const getNodeData_1 = require("./getNodeData");
/**
 * Tests a node against parsed filters, independently of response projections.
 * staticId maps to info.id; dynamicId and server_id map to _server_id.
 * Missing/undefined values match only exists=false, never ne.
 * Empty strings, false and 0 exist. Graph read errors propagate.
 */
async function matchesNodeFilter(node, filters) {
    let attributes;
    let attributesLoaded = false;
    for (const filter of filters) {
        const [root, category, attribute] = filter.field.split('.');
        let value;
        if (root === 'dynamicId' || root === 'server_id') {
            value = node._server_id;
        }
        else if (root === 'info') {
            const info = (0, getNodeData_1.extractNodeInfo)([category], node);
            value = info && Object.prototype.hasOwnProperty.call(info, category)
                ? info[category]
                : undefined;
        }
        else if (root === 'attributes') {
            if (!attributesLoaded) {
                const query = Object.create(null);
                for (const condition of filters) {
                    const [kind, cat, attr] = condition.field.split('.');
                    if (kind !== 'attributes')
                        continue;
                    if (!query[cat])
                        query[cat] = [];
                    query[cat].push(attr);
                }
                attributes = await (0, getNodeData_1.extractNodeAttr)(node, query, false);
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
        if (!matchesValue(value, filter))
            return false;
    }
    return true;
}
function matchesValue(value, filter) {
    if (filter.operator === 'exists') {
        return (value !== undefined) === filter.value;
    }
    if (typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean') {
        return false;
    }
    if (filter.operator === 'eq' || filter.operator === 'ne') {
        let expected = filter.value;
        if (typeof value === 'number') {
            const number = (0, parseFilterQuery_1.parseFilterNumber)(expected);
            if (number === undefined)
                return false;
            expected = number;
        }
        else if (typeof value === 'boolean') {
            if (expected === 'true')
                expected = true;
            if (expected === 'false')
                expected = false;
            if (typeof expected !== 'boolean')
                return false;
        }
        else {
            expected = String(expected);
        }
        return filter.operator === 'eq' ? value === expected : value !== expected;
    }
    const actual = (0, parseFilterQuery_1.parseFilterNumber)(value);
    const expected = (0, parseFilterQuery_1.parseFilterNumber)(filter.value);
    if (actual === undefined || expected === undefined)
        return false;
    switch (filter.operator) {
        case 'gt': return actual > expected;
        case 'gte': return actual >= expected;
        case 'lt': return actual < expected;
        case 'lte': return actual <= expected;
    }
}
//# sourceMappingURL=matchesNodeFilter.js.map