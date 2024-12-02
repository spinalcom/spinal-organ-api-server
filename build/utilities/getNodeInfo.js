"use strict";
/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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
exports.getNodeInfo = void 0;
const corseChildrenAndParentNode_1 = require("./corseChildrenAndParentNode");
async function getNodeInfo(spinalAPIMiddleware, profileId, dynamicId, includeChildrenRelations, includeParentRelations) {
    const node = await spinalAPIMiddleware.load(dynamicId, profileId);
    let childrens_list = [];
    let parents_list = [];
    if (includeChildrenRelations) {
        childrens_list = (0, corseChildrenAndParentNode_1.childrensNode)(node);
    }
    if (includeParentRelations) {
        parents_list = await (0, corseChildrenAndParentNode_1.parentsNode)(node);
    }
    const info = {
        dynamicId: node._server_id,
        staticId: node.getId().get(),
        name: node.getName().get(),
        type: node.getType().get(),
        children_relation_list: childrens_list,
        parent_relation_list: parents_list
    };
    return info;
}
exports.getNodeInfo = getNodeInfo;
exports.default = getNodeInfo;
//# sourceMappingURL=getNodeInfo.js.map