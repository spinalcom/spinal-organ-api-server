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
exports.handleSetAttribute = handleSetAttribute;
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
/**
 * Handles setting attributes on a given SpinalNode based on the provided request and default categories.
 * @export
 * @param {SpinalNode} node
 * @param {(Record<string, Record<string, string>>)} requestCats The categories and attributes requested to be set on the node.
 * @param {(Record<string, Record<string, string>>)} defaultCats The default categories and attributes to fill.
 */
async function handleSetAttribute(node, requestCats, defaultCats) {
    const categories = mergeCategoryAttributes(requestCats, defaultCats);
    for (const categoryName in categories) {
        if (!Object.hasOwn(categories, categoryName))
            continue;
        const attrs = categories[categoryName];
        await spinal_env_viewer_plugin_documentation_service_1.attributeService.createOrUpdateAttrsAndCategories(node, categoryName, attrs);
    }
}
function mergeCategoryAttributes(requestCats, defaultCats) {
    const categories = {};
    if (requestCats) {
        for (const categoryName in requestCats) {
            if (!Object.hasOwn(requestCats, categoryName))
                continue;
            categories[categoryName] = requestCats[categoryName];
        }
    }
    if (defaultCats) {
        // fill in categories with defaultCats if not already present
        for (const categoryName in defaultCats) {
            if (!Object.hasOwn(defaultCats, categoryName))
                continue;
            if (categories[categoryName]) {
                // merge default attributes into existing category
                for (const attrName in defaultCats[categoryName]) {
                    if (!Object.hasOwn(defaultCats[categoryName], attrName))
                        continue;
                    if (!(attrName in categories[categoryName])) {
                        categories[categoryName][attrName] =
                            defaultCats[categoryName][attrName];
                    }
                }
            }
            else {
                categories[categoryName] = defaultCats[categoryName];
            }
        }
    }
    return categories;
}
//# sourceMappingURL=handleSetAttribute.js.map