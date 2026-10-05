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
exports.parseAttributesQuery = parseAttributesQuery;
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
function parseAttributesQuery(attributes) {
    if (attributes === undefined) {
        return false;
    }
    if (attributes === 'true') {
        return true;
    }
    if (attributes === 'false') {
        return false;
    }
    if (typeof attributes === 'string') {
        const result = {};
        const categories = attributes.split(',');
        for (const category of categories) {
            const [cat, attr] = category.split('/');
            const trimmedCat = cat.trim();
            const trimmedAttr = attr?.trim();
            if (!trimmedCat)
                continue;
            if (!result[trimmedCat]) {
                result[trimmedCat] = [];
            }
            if (trimmedAttr && typeof result[trimmedCat] !== 'boolean') {
                result[trimmedCat].push(trimmedAttr);
            }
            else {
                result[trimmedCat] = true;
            }
        }
        return result;
    }
    throw new Error('Invalid attributes query parameter: ' + attributes);
}
//# sourceMappingURL=parseAttributesQuery.js.map