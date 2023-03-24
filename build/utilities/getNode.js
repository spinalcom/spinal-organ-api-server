"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
function getNode(spinalAPIMiddleware, dynamicId, staticId, profileId) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (dynamicId) {
            try {
                var node = yield spinalAPIMiddleware.load(parseInt(dynamicId, 10), profileId);
                return node;
            }
            catch (error) {
            }
        }
        if (staticId && typeof staticId === "string") {
            const node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(staticId);
            if (node !== undefined) {
                return node;
            }
            else {
                const context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext("spatial");
                if (context === undefined) {
                    return undefined;
                }
                else {
                    const it = context.visitChildrenInContext(context);
                    try {
                        for (var it_1 = __asyncValues(it), it_1_1; it_1_1 = yield it_1.next(), !it_1_1.done;) {
                            const node = it_1_1.value;
                            if (node.info.id.get() === staticId) {
                                return node;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (it_1_1 && !it_1_1.done && (_a = it_1.return)) yield _a.call(it_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            }
        }
    });
}
exports.default = getNode;
//# sourceMappingURL=getNode.js.map