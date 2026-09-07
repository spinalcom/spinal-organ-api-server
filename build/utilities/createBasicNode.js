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
exports.createBasicNodeSync = createBasicNodeSync;
exports.createBasicNode = createBasicNode;
const awaitSync_1 = require("./awaitSync");
async function createBasicNodeSync(node, attrToAdd) {
    await (0, awaitSync_1.awaitSync)(node); // Wait for the _server_id to be assigned by hub
    return Array.isArray(attrToAdd)
        ? createBasicNode(node, attrToAdd)
        : createBasicNode(node);
}
function createBasicNode(node, attrToAdd) {
    const res = {
        name: node.info.name.get(),
        staticId: node.info.id.get(),
        dynamicId: node._server_id,
        type: node.info.type.get(),
    };
    // Ensure attrNames is an array of strings
    const attrNames = Array.isArray(attrToAdd) ? attrToAdd : [];
    // Add default attributes to the list of attributes to add
    attrNames.push('icon', 'bimFileId', 'dbid');
    if (attrToAdd) {
        for (const attr of attrNames) {
            if (node.info[attr]) {
                res[attr] = node.info[attr].get();
            }
        }
    }
    return res;
}
//# sourceMappingURL=createBasicNode.js.map