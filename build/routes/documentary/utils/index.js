"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHubUrl = getHubUrl;
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
//# sourceMappingURL=index.js.map