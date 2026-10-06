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
exports.EApiErrorType = void 0;
var EApiErrorType;
(function (EApiErrorType) {
    EApiErrorType["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    EApiErrorType["NOT_FOUND"] = "NOT_FOUND";
    EApiErrorType["UNAUTHORIZED"] = "UNAUTHORIZED";
    EApiErrorType["INVALID_REQUEST"] = "INVALID_REQUEST";
    EApiErrorType["ERROR_DATABASE"] = "ERROR_DATABASE";
    EApiErrorType["INVALID_LOAD_NODE"] = "INVALID_LOAD_NODE";
    EApiErrorType["INVALID_LOAD_NODE_TYPE"] = "INVALID_LOAD_NODE_TYPE";
    // if you add more error types,
    // make sure to update the `getHTTPStatusCode` function accordingly
})(EApiErrorType || (exports.EApiErrorType = EApiErrorType = {}));
//# sourceMappingURL=EApiErrorType.js.map