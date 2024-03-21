"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryNamesInfo = exports.getCategoryNameInfo = void 0;
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
async function getCategoryNameInfo(spinalAPIMiddleware, profileId, dynamicId, categoryName) {
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    const result = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation._categoryExist(node, categoryName);
    if (result === undefined) {
        throw new Error('category not found in node');
    }
    else {
        return {
            dynamicId: result._server_id,
            staticId: result.getId().get(),
            name: result.getName().get(),
            type: result.getType().get(),
        };
    }
}
exports.getCategoryNameInfo = getCategoryNameInfo;
async function getCategoryNamesInfo(spinalAPIMiddleware, profileId, dynamicId, categoryNames) {
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    const result = [];
    for (const categoryName of categoryNames) {
        const categoryNode = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation._categoryExist(node, categoryName);
        if (categoryNode === undefined) {
            throw new Error('category not found in node');
        }
        else {
            result.push({
                dynamicId: categoryNode._server_id,
                staticId: categoryNode.getId().get(),
                name: categoryNode.getName().get(),
                type: categoryNode.getType().get(),
            });
        }
    }
    return result;
}
exports.getCategoryNamesInfo = getCategoryNamesInfo;
//# sourceMappingURL=getCategoryNameInfo.js.map