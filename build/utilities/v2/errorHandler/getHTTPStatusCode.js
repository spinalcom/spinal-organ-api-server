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
exports.getHTTPStatusCode = getHTTPStatusCode;
const createErrorMsgItem_1 = require("./createErrorMsgItem");
const EApiErrorType_1 = require("./EApiErrorType");
function getHTTPStatusCode(error) {
    if ((0, createErrorMsgItem_1.isErrorItem)(error)) {
        switch (error.errorType) {
            case EApiErrorType_1.EApiErrorType.INTERNAL_ERROR:
                return 500;
            case EApiErrorType_1.EApiErrorType.NOT_FOUND:
                return 404;
            case EApiErrorType_1.EApiErrorType.UNAUTHORIZED:
                return 401;
            case EApiErrorType_1.EApiErrorType.INVALID_REQUEST:
                return 400;
            case EApiErrorType_1.EApiErrorType.ERROR_DATABASE:
                return 400;
            case EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE:
                return 400;
            case EApiErrorType_1.EApiErrorType.INVALID_LOAD_NODE_TYPE:
                return 400;
            default:
                return 400;
        }
    }
    return 500;
}
//# sourceMappingURL=getHTTPStatusCode.js.map