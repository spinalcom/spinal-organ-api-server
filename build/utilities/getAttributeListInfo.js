"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttributeListInfo = void 0;
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
async function getAttributeListInfo(spinalAPIMiddleware, profileId, dynamicId) {
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    const childrens = await node.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION);
    const attributesPromises = childrens.map(async (child) => {
        const attributs = await child.element.load();
        const attributes = [];
        for (const attribute of attributs) {
            const attrib = attribute.get();
            attributes.push({
                ...attrib,
                dynamicId: attribute._server_id,
                label: attribute.label.get(),
                value: attribute.value.get(),
            });
        }
        return {
            dynamicId: child._server_id,
            staticId: child.getId().get(),
            name: child.getName().get(),
            type: child.getType().get(),
            attributs: attributes,
        };
    });
    return Promise.all(attributesPromises);
}
exports.getAttributeListInfo = getAttributeListInfo;
exports.default = getAttributeListInfo;
//# sourceMappingURL=getAttributeListInfo.js.map