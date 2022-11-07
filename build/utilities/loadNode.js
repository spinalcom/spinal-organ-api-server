"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._load = void 0;
const spinalAPIMiddleware_1 = require("../spinalAPIMiddleware");
function _load(arrayofServerId) {
    return Promise.all(arrayofServerId.map(item => {
        return spinalAPIMiddleware_1.default.getInstance().load(item).catch(() => undefined);
    }));
}
exports._load = _load;
//# sourceMappingURL=loadNode.js.map