"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHubUrl = getHubUrl;
exports.waitUntilServerIdNotDefined = waitUntilServerIdNotDefined;
exports._formatFileNode = _formatFileNode;
exports._formatFileVersion = _formatFileVersion;
function createUrl(urlStr, port, protocol = "http") {
    urlStr = urlStr.startsWith(protocol) ? urlStr : `${protocol}://${urlStr}`;
    urlStr = typeof port !== "undefined" ? `${urlStr}:${port}` : urlStr;
    const url = new URL(urlStr);
    return url;
}
function getHubUrl(spinalAPIMiddleware) {
    const hubUrl = createUrl(spinalAPIMiddleware.config.spinalConnector.host, spinalAPIMiddleware.config.spinalConnector.port, spinalAPIMiddleware.config.spinalConnector.protocol);
    return hubUrl.toString();
}
function waitUntilServerIdNotDefined(node) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkCondition = () => {
            if (typeof node._server_id !== "undefined") {
                resolve(true);
                return;
            }
            setTimeout(checkCondition, 500);
        };
        checkCondition();
    });
}
function _formatFileNode(node) {
    return {
        dynamicId: node._server_id,
        name: node?.info?.name?.get() || node?.name?.get(),
        type: node?.info?.type?.get() || node?.type?.get(),
    };
}
function _formatFileVersion(version, fileName) {
    return {
        name: fileName,
        versionId: version.id.get(),
        versionName: version.version.get(),
    };
}
//# sourceMappingURL=index.js.map