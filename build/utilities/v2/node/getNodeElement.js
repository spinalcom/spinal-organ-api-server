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
exports.serializeModel = exports.parseElementQuery = void 0;
exports.getNodeElement = getNodeElement;
const serializeModel_1 = require("./element/serializeModel");
var parseElementQuery_1 = require("../requestParse/parseElementQuery");
Object.defineProperty(exports, "parseElementQuery", { enumerable: true, get: function () { return parseElementQuery_1.parseElementQuery; } });
var serializeModel_2 = require("./element/serializeModel");
Object.defineProperty(exports, "serializeModel", { enumerable: true, get: function () { return serializeModel_2.serializeModel; } });
async function getNodeElement(node, query) {
    if (query === false)
        return undefined;
    const element = await node.getElement(true);
    if (element === undefined)
        return null;
    return (0, serializeModel_1.serializeModel)(element, query);
}
//# sourceMappingURL=getNodeElement.js.map