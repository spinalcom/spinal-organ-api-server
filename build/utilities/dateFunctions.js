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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifDate = verifDate;
exports.sendDate = sendDate;
const moment_1 = __importDefault(require("moment"));
function verifDate(date) {
    const res = (0, moment_1.default)(date, [
        'DD-MM-YYYY',
        'DD-MM-YYYY HH:mm:ss',
        'DD MM YYYY',
        'DD MM YYYY HH:mm:ss',
        'DD/MM/YYYY',
        'DD/MM/YYYY HH:mm:ss',
    ], 'fr', true); // uses 'fr' locale and strict parsing
    if (!res.isValid())
        return 1;
    else
        return res.toDate();
}
function sendDate(date) {
    const res = (0, moment_1.default)(date, [
        'DD-MM-YYYY',
        'DD-MM-YYYY HH:mm:ss',
        'DD MM YYYY',
        'DD MM YYYY HH:mm:ss',
        'DD/MM/YYYY',
        'DD/MM/YYYY HH:mm:ss',
    ], 'fr', true); // uses 'fr' locale and strict parsing
    return res;
}
//# sourceMappingURL=dateFunctions.js.map