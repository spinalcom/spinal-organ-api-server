"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpatialContext = void 0;
async function getSpatialContext(spinalAPIMiddleware, profileId) {
    const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
    const contexts = await userGraph.getChildren('hasContext');
    const spatialContext = contexts.find((el) => el.getName().get() === 'spatial' &&
        el.getType().get() === 'geographicContext');
    if (!spatialContext)
        throw new Error('spatial context not found');
    return spatialContext;
}
exports.getSpatialContext = getSpatialContext;
//# sourceMappingURL=getSpatialContext.js.map