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
exports.sendResponseError = sendResponseError;
const createErrorMsgItem_1 = require("./createErrorMsgItem");
const EApiErrorType_1 = require("./EApiErrorType");
const getHTTPStatusCode_1 = require("./getHTTPStatusCode");
function sendResponseError(res, error) {
    console.error(error);
    if ((0, createErrorMsgItem_1.isErrorItem)(error)) {
        return res.status((0, getHTTPStatusCode_1.getHTTPStatusCode)(error)).json(error);
    }
    return res.status(500).json({
        errorType: EApiErrorType_1.EApiErrorType.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
    });
}
//# sourceMappingURL=sendResponseError.js.map