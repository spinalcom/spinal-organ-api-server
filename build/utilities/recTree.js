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
Object.defineProperty(exports, "__esModule", { value: true });
exports.recTreeDepth = exports.recTree = void 0;
function recTree(node, context = node) {
    return __awaiter(this, void 0, void 0, function* () {
        const childrenIds = yield node.getChildrenInContext(context);
        if (childrenIds.length > 0) {
            var promises = childrenIds.map((realnode) => __awaiter(this, void 0, void 0, function* () {
                const name = realnode.getName();
                const type = realnode.getType();
                return {
                    dynamicId: realnode._server_id,
                    staticId: realnode.getId().get(),
                    name: name ? name.get() : undefined,
                    type: type ? type.get() : undefined,
                    children: yield recTree(realnode, context)
                };
            }));
            return Promise.all(promises);
        }
        else {
            return [];
        }
    });
}
exports.recTree = recTree;
function recTreeDetails(node, context = node) {
    return __awaiter(this, void 0, void 0, function* () {
        const childrenIds = yield node.getChildrenInContext(context);
        if (childrenIds.length > 0) {
            var promises = childrenIds.map((realnode) => __awaiter(this, void 0, void 0, function* () {
                const name = realnode.getName();
                const type = realnode.getType();
                if (type.get() === "geographicFloor") {
                    realnode;
                }
                return {
                    dynamicId: realnode._server_id,
                    staticId: realnode.getId().get(),
                    name: name ? name.get() : undefined,
                    type: type ? type.get() : undefined,
                    children: yield recTree(realnode, context)
                };
            }));
            return Promise.all(promises);
        }
        else {
            return [];
        }
    });
}
function recTreeDepth(node, context = node, depth) {
    return __awaiter(this, void 0, void 0, function* () {
        const childrenIds = yield node.getChildrenInContext(context);
        if (childrenIds.length > 0 && depth > 0) {
            var promises = childrenIds.map((realnode) => __awaiter(this, void 0, void 0, function* () {
                const name = realnode.getName();
                const type = realnode.getType();
                var info = {
                    dynamicId: realnode._server_id,
                    staticId: realnode.getId().get(),
                    name: name ? name.get() : undefined,
                    type: type ? type.get() : undefined,
                    children: yield recTreeDepth(realnode, context, depth - 1)
                };
                return info;
            }));
            return Promise.all(promises);
        }
        else {
            return [];
        }
    });
}
exports.recTreeDepth = recTreeDepth;
//# sourceMappingURL=recTree.js.map