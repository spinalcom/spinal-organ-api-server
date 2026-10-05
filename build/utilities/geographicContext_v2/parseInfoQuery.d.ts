/**
 * Parses the 'info' query string into an object representation.
 * The query string can have the following values:
 * - 'true' or an empty string: returns `true`.
 * - 'false' or `undefined`: returns the default fields array.
 * - A comma-separated list of field names: returns an array of trimmed field names.
 *
 * @param query The value of the 'info' query string to parse.
 * @returns An object representing the parsed info fields.
 */
export declare function parseInfoQuery(query?: string): true | string[];
