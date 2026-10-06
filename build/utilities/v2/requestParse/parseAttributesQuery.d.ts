/**
 * Parse the "attributes" query parameter.
 * - Attribute can be a boolean or a string joining multiple category / attribute names.
 * - true means include all attributes, false or undefined means include none.
 * - If a string is provided, it should be parsed into a record of category/attribute names.
 *   - The attribute name is optionnal and if omitted: all attributes in the category are included.
 *
 * Examples:
 * ```
 *   true => include all attributes
 *   false => include no attributes (default)
 *   "category1/attribute1,category2" => include attribute1 in category1 and all attributes in category2
 *   "category1" => include all attributes in category1
 * ```
 * @param {string} [attributes] The "attributes" query parameter to parse as string.
 * @return {*}  {Record<string, string[] | boolean> | boolean}
 */
export declare function parseAttributesQuery(attributes?: string): Record<string, string[] | boolean> | boolean;
