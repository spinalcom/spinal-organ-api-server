"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHubUrl = getHubUrl;
exports.waitUntilServerIdNotDefined = waitUntilServerIdNotDefined;
exports._formatFileNode = _formatFileNode;
exports._formatFileVersion = _formatFileVersion;
exports.getFileAttributes = getFileAttributes;
exports.getContexts = getContexts;
exports.getParents = getParents;
const spinal_env_viewer_plugin_documentation_service_1 = __importStar(require("spinal-env-viewer-plugin-documentation-service"));
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
async function getFileAttributes(node) {
    const categories = await spinal_env_viewer_plugin_documentation_service_1.default.getCategory(node);
    return categories
        .map((category) => {
        const res = [];
        for (const attribute of Array.from(category.element)) {
            const attr = attribute.get();
            attr.categoryName = category.nameCat;
            res.push(attr);
        }
        return res;
    })
        .flat();
}
async function getContexts(filenode, graph) {
    const contexts = await graph.getChildren("hasContext");
    return contexts.reduce((acc, context) => {
        if (filenode.belongsToContext(context) || filenode._server_id === context._server_id) {
            acc.push(context);
        }
        return acc;
    }, []);
}
async function getParents(node, contexts) {
    const parents = await node.getParents();
    const result = [];
    for (let parent of parents) {
        const isRoot = isRootDirectoryNode(parent);
        if (isRoot)
            parent = (await getRootParent(parent)) || parent;
        const context = isInContext(parent, contexts);
        result.push(formatParentNode(parent, context));
    }
    return result;
}
function isInContext(node, contexts) {
    return contexts.find((context) => node.belongsToContext(context) || node._server_id === context._server_id);
}
function formatParentNode(parent, context) {
    return {
        dynamicId: parent._server_id,
        ...parent.info.get(),
        contextDynamicId: context?._server_id,
    };
}
async function getRootParent(rootNode) {
    const parents = await rootNode.getParents();
    return parents.length > 0 ? parents[0] : null;
}
function isRootDirectoryNode(node) {
    return node.getType().get() == spinal_env_viewer_plugin_documentation_service_1.DIRECTORY_NODE_TYPE && node.getName().get().endsWith("_root_directory");
}
//# sourceMappingURL=index.js.map