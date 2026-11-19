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
exports.resolveInfo = resolveInfo;
exports.handleSetInfo = handleSetInfo;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const setOrCreateInfo_1 = require("./setOrCreateInfo");
const createElement_1 = require("./createElement");
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
async function resolveInfo(info, middleware, profileId) {
    const data = {};
    for (const [key, value] of Object.entries(info)) {
        if (value !== undefined)
            data[key] = value;
    }
    return (0, createElement_1.createElement)(data, middleware, profileId);
}
async function handleSetInfo(node, info, middleware, profileId) {
    if (!info)
        return;
    if (info instanceof spinal_core_connectorjs_1.Model) {
        for (const key of info._attribute_names) {
            node.info.mod_attr(key === 'staticId' ? 'id' : key, info[key]);
        }
        return;
    }
    if (Object.values(info).some((value) => typeof value === 'object' && value !== null)) {
        if (!middleware || profileId === undefined) {
            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INTERNAL_ERROR, 'Structured info requires middleware and profile ID');
        }
        return handleSetInfo(node, await resolveInfo(info, middleware, profileId));
    }
    for (const attrName in info) {
        if (!Object.hasOwn(info, attrName))
            continue;
        const element = info[attrName];
        if (element === undefined)
            continue;
        if (typeof element === 'object')
            continue;
        let name = attrName === 'staticId' ? 'id' : attrName;
        (0, setOrCreateInfo_1.setOrCreateInfo)(node, name, element);
    }
}
//# sourceMappingURL=handleSetInfo.js.map