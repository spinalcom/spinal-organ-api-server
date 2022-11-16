"use strict";
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitNodesWithTypeRelation = void 0;
const Utilities_1 = require("spinal-model-graph/dist/Utilities");
function visitNodesWithTypeRelation(root, relationMap) {
    return __asyncGenerator(this, arguments, function* visitNodesWithTypeRelation_1() {
        const seen = new Set([root]);
        let promises = [];
        let nextGen = [root];
        let currentGen = [];
        while (nextGen.length) {
            currentGen = nextGen;
            promises = [];
            nextGen = [];
            for (const node of currentGen) {
                yield yield __await(node);
                const nodeType = node.info.type.get();
                const relations = relationMap[nodeType];
                if (relations &&
                    ((Array.isArray(relations) && relations.length > 0) ||
                        !Array.isArray(relations)))
                    promises.push(() => node.getChildren(relations));
            }
            const childrenArrays = yield __await((0, Utilities_1.consumeBatch)(promises, 30));
            for (const children of childrenArrays) {
                for (const child of children) {
                    if (!seen.has(child)) {
                        nextGen.push(child);
                        seen.add(child);
                    }
                }
            }
        }
    });
}
exports.visitNodesWithTypeRelation = visitNodesWithTypeRelation;
//# sourceMappingURL=visitNodesWithTypeRelation.js.map