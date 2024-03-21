"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
exports.parentsNode = exports.childrensNode = void 0;
function childrensNode(node) {
    const childs = node.children;
    const res = [];
    // childrens relation course
    for (const [relationTypeName, relationTypeMap] of childs) {
        for (const [relationName, relation] of relationTypeMap) {
            const child = {
                dynamicId: relation._server_id,
                staticId: relation.getId().get(),
                name: relation.getName().get(),
                children_number: relation.getNbChildren()
            };
            res.push(child);
        }
    }
    return res;
}
exports.childrensNode = childrensNode;
async function parentsNode(node) {
    const parents = node.parents;
    const auxtab = [];
    let res = [];
    for (const [, ptrList] of parents) {
        for (let i = 0; i < ptrList.length; i++) {
            auxtab.push(ptrList[i].load());
        }
    }
    res = await Promise.all(auxtab).then((values) => {
        return values.map((node) => {
            return { dynamicId: node._server_id, staticId: node.getId().get(), name: node.getName().get(), children_number: node.getNbChildren() };
        });
    });
    return res;
}
exports.parentsNode = parentsNode;
//# sourceMappingURL=corseChildrenAndParentNode.js.map