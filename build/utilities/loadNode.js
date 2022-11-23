"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._load = void 0;
function _load(arrayofServerId, spinalAPIMiddleware, profileId) {
    return Promise.all(arrayofServerId.map(item => {
        return spinalAPIMiddleware.load(item, profileId).catch(() => undefined);
    }));
}
exports._load = _load;
//# sourceMappingURL=loadNode.js.map