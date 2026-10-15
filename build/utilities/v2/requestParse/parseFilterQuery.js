"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFilterQuery = parseFilterQuery;
exports.parseFilterNumber = parseFilterNumber;
exports.parseOffsetQuery = parseOffsetQuery;
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
function invalidQuery(message) {
    throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, message);
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function parseFilterObject(value, label) {
    if (typeof value === 'string') {
        try {
            value = JSON.parse(value);
        }
        catch (error) {
            if (!(error instanceof SyntaxError))
                throw error;
            invalidQuery(`${label} must contain valid JSON`);
        }
    }
    if (!isRecord(value))
        invalidQuery(`${label} must be an object`);
    return value;
}
function isOperator(value) {
    return ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'exists'].includes(value);
}
function parseConditions(value, field) {
    if (typeof value === 'number' ||
        typeof value === 'boolean' ||
        (typeof value === 'string' && !/^[{[]/.test(value.trimStart()))) {
        return { eq: value };
    }
    return parseFilterObject(value, `Filter ${field}`);
}
/**
 * Parses Express's extended query format: filter[info.type][eq]=room.
 * Also accepts JSON for the whole filter or each field's operator object.
 * JSON is decoded once at each level, then validated using the same rules.
 * Scalar field values default to eq without coercing strings.
 * Strings starting with { or [ are treated as JSON operator objects;
 * use explicit eq to compare literal strings starting with those characters.
 * Fields: dynamicId (or server_id), info.<key>, attributes.<category>.<name>.
 * info.staticId resolves to the model's info.id.
 * Filters are ANDed. Equality preserves strings (including leading zeros);
 * numeric/boolean node values are compared using their own type.
 * Ordering operators require finite decimal numbers, including for attributes.
 * Attribute equality compares its stored string, not modification metadata.
 * exists accepts only true/false: false matches missing or undefined values.
 * Empty strings, false and 0 count as existing. Only scalar info fields are
 * exposed; non-scalar info fields are treated as missing.
 * Invalid input throws an INVALID_REQUEST item for sendResponseError.
 *
 * Example URLs for a GET route that integrates these helpers:
 * ```
 * // String and boolean equality
 * GET /nodes?filter[info.type][eq]=room
 * GET /nodes?filter[info.virtual][eq]=false
 * GET /nodes?filter[info.name][eq]=Meeting%20Room
 * GET /nodes?filter[info.type]=room
 * GET /nodes?filter[info.virtual]=false
 * GET /nodes?filter={"info.virtual":false,"info.type":"room"}
 *
 * // Equivalent JSON forms (URL-encode JSON when sending the request)
 * GET /nodes?filter[info.virtual]={"eq":"false"}
 * GET /nodes?filter={"info.virtual":{"eq":"false"}}
 *
 * // Inequality and identifiers (server_id is an alias for dynamicId)
 * GET /nodes?filter[info.type][ne]=floor
 * GET /nodes?filter[info.staticId][eq]=abc123
 * GET /nodes?filter[dynamicId][eq]=123
 * GET /nodes?filter[server_id][gte]=100
 *
 * // Existence and missing/undefined checks (not the literal string "undefined")
 * GET /nodes?filter[attributes.Geometry.Surface][exists]=true
 * GET /nodes?filter[attributes.Geometry.Surface][exists]=false
 * GET /nodes?filter[info.virtual][exists]=false
 *
 * // Numeric attribute comparisons and a range: 20 < Surface <= 100
 * GET /nodes?filter[attributes.Geometry.Surface][gt]=20
 * GET /nodes?filter[attributes.Geometry.Surface][lt]=100
 * GET /nodes?filter[attributes.Geometry.Surface][gt]=20&filter[attributes.Geometry.Surface][lte]=100
 *
 * // Multiple fields are ANDed
 * GET /nodes?filter[info.type][eq]=room&filter[info.virtual][eq]=false&filter[attributes.Geometry.Surface][gte]=20
 *
 * // Fixed pages of up to 200 matches; omitted offset means 0
 * GET /nodes?filter[info.type][eq]=room&offset=0
 * GET /nodes?filter[info.type][eq]=room&offset=200
 * GET /nodes?filter[info.type][eq]=room&offset=400
 * ```
 */
function parseFilterQuery(query) {
    if (Object.keys(query).some((key) => key.startsWith('filter['))) {
        invalidQuery('Filter queries require the Express extended query parser');
    }
    if (query.filter === undefined)
        return [];
    const filter = parseFilterObject(query.filter, 'filter');
    const filters = [];
    for (const [field, rawConditions] of Object.entries(filter)) {
        const parts = field.split('.');
        const validField = field === 'dynamicId' ||
            field === 'server_id' ||
            (parts[0] === 'info' && parts.length === 2) ||
            (parts[0] === 'attributes' && parts.length === 3);
        if (!validField ||
            parts.some((part) => ['', '__proto__', 'constructor', 'prototype'].includes(part))) {
            invalidQuery(`Unsupported filter field: ${field}`);
        }
        const conditions = parseConditions(rawConditions, field);
        if (Object.keys(conditions).length === 0) {
            invalidQuery(`Filter ${field} must contain at least one operator`);
        }
        for (const [operator, value] of Object.entries(conditions)) {
            if (!isOperator(operator)) {
                invalidQuery(`Unsupported filter operator: ${operator}`);
            }
            if (typeof value !== 'string' &&
                typeof value !== 'number' &&
                typeof value !== 'boolean') {
                invalidQuery(`Filter ${field}.${operator} requires a scalar value`);
            }
            if (typeof value === 'number' && !Number.isFinite(value)) {
                invalidQuery(`Filter ${field}.${operator} requires a finite value`);
            }
            if (operator === 'exists') {
                if (value !== true && value !== false && value !== 'true' && value !== 'false') {
                    invalidQuery(`Filter ${field}.exists requires true or false`);
                }
                filters.push({ field, operator, value: value === true || value === 'true' });
            }
            else if (operator !== 'eq' && operator !== 'ne') {
                const numericValue = parseFilterNumber(value);
                if (numericValue === undefined) {
                    invalidQuery(`Filter ${field}.${operator} requires a finite number`);
                }
                filters.push({ field, operator, value: numericValue });
            }
            else {
                filters.push({ field, operator, value });
            }
        }
    }
    return filters;
}
function parseFilterNumber(value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value !== 'string' ||
        !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) {
        return undefined;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
}
/**
 * Parses a non-negative safe integer offset, defaulting to 0.
 * Offset counts matching nodes, not the unfiltered input. Page size is 200.
 * Throws INVALID_REQUEST for invalid input.
 *
 * Prefer Zod validation in routes when available:
 * ```
 * offset: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER)
 *   .optional().default(0)
 * ```
 * After validation, use req.query.offset directly instead of calling this
 * parser in the route. Keep this helper for callers without Zod, including
 * filterNodes, which validates its offset independently.
 * Unlike this parser's digit-only string input, Zod coercion also accepts
 * numeric forms such as "1e2" and converts an empty string to 0.
 */
function parseOffsetQuery(query) {
    const offset = query.offset === undefined ? 0 : query.offset;
    if ((typeof offset !== 'number' &&
        (typeof offset !== 'string' || !/^\d+$/.test(offset))) ||
        !Number.isSafeInteger(Number(offset)) ||
        Number(offset) < 0) {
        invalidQuery('offset must be a non-negative safe integer');
    }
    return Number(offset);
}
//# sourceMappingURL=parseFilterQuery.js.map