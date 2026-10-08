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
exports.getNodeChildrenFromParentDynId = getNodeChildrenFromParentDynId;
const loadAndValidateNode_1 = require("../../loadAndValidateNode");
async function getNodeChildrenFromParentDynId(spinalAPIMiddleware, parentDynamicId, profileId, childrenType, relations) {
    const parentNode = await (0, loadAndValidateNode_1.loadAndValidateNode)(spinalAPIMiddleware, parentDynamicId, profileId);
    for (const relation of relations) {
        if (parentNode.getType().get() !== relation.parentType)
            continue;
        if (relation.context) {
            const children = await parentNode.getChildrenInContext(relation.context, relation.relationName);
            return children.filter((child) => child.getType().get() === childrenType);
        }
        else {
            const children = await parentNode.getChildren(relation.relationName);
            return children.filter((child) => child.getType().get() === childrenType);
        }
    }
    return [];
}
//# sourceMappingURL=getNodeChildrenFromParentDynId.js.map