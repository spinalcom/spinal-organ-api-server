"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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
exports.parseElementQuery = parseElementQuery;
const createErrorMsgItem_1 = require("../errorHandler/createErrorMsgItem");
const EApiErrorType_1 = require("../errorHandler/EApiErrorType");
function parseElementQuery(query) {
    if (query === undefined || query.trim().toLowerCase() === "false")
        return false;
    if (query.trim() === "" || query.trim().toLowerCase() === "true")
        return true;
    return query.split(",").map((field) => {
        const path = field.trim().split(".");
        if (path.some((key) => !key ||
            key.startsWith("_") ||
            key === "constructor" ||
            key === "prototype" ||
            key === "model_id") ||
            path.length > 32) {
            throw (0, createErrorMsgItem_1.createErrorMsgItem)(EApiErrorType_1.EApiErrorType.INVALID_REQUEST, "Invalid element field path (maximum depth: 32)");
        }
        return path;
    });
}
//# sourceMappingURL=parseElementQuery.js.map