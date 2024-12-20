"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttributeListInfo = void 0;
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
async function getAttributeListInfo(spinalAPIMiddleware, profileId, dynamicId) {
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    const childrens = await node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
    const attributesPromises = childrens.map(async (child) => {
        const attributs = await child.element.load();
        const attributes = [];
        for (const attribute of attributs) {
            attributes.push({
                dynamicId: attribute._server_id,
                label: attribute.label.get(),
                value: attribute.value.get(),
                date: attribute.date.get(),
                type: attribute.type.get(),
                unit: attribute.unit.get(),
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