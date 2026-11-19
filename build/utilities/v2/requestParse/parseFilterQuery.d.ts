export type NodeFilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'exists';
export interface IQueryFilterNode {
    field: string;
    operator: NodeFilterOperator;
    value: string | number | boolean;
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
export declare function parseFilterQuery(query: Record<string, unknown>): IQueryFilterNode[];
export declare function parseFilterNumber(value: unknown): number | undefined;
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
export declare function parseOffsetQuery(query: Record<string, unknown>): number;
