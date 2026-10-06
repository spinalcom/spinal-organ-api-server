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
exports.SERVER_ID_TIMEOUT_MS = void 0;
exports.getHubUrl = getHubUrl;
exports.waitUntilServerIdNotDefined = waitUntilServerIdNotDefined;
exports.hasDefinitiveServerId = hasDefinitiveServerId;
exports.runExclusive = runExclusive;
exports.normalizeFileName = normalizeFileName;
exports.toDocumentaryNode = toDocumentaryNode;
exports.reserveChildNames = reserveChildNames;
exports._formatFileNode = _formatFileNode;
exports._formatFileVersion = _formatFileVersion;
exports.getFileAttributes = getFileAttributes;
exports.getContexts = getContexts;
exports.getParents = getParents;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
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
exports.SERVER_ID_TIMEOUT_MS = 30000;
// Resolves once the hub has assigned a definitive _server_id to the model. A model created locally first
// gets a temporary id (kept in FileSystem._tmp_objects, never a multiple of 4) when it is sent to the hub;
// FileSystem._tmp_id_to_real then replaces it with the real id and registers the model in
// FileSystem._objects, which is what is checked here (same test as utilities/awaitSync). Rejects with a
// 503 error if the hub does not answer within timeoutMs.
function waitUntilServerIdNotDefined(node, timeoutMs = exports.SERVER_ID_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkCondition = () => {
            if (hasDefinitiveServerId(node)) {
                resolve(true);
                return;
            }
            if (Date.now() - startTime >= timeoutMs) {
                reject({ code: 503, message: `The hub did not confirm the creation of the object within ${timeoutMs / 1000} s, try again later` });
                return;
            }
            setTimeout(checkCondition, 100);
        };
        checkCondition();
    });
}
function hasDefinitiveServerId(node) {
    const serverId = node?._server_id;
    return typeof serverId === "number" && spinal_core_connectorjs_1.FileSystem._objects[serverId] === node;
}
// Serializes the tasks sharing the same key (in memory, so only within this process).
const exclusiveTasks = new Map();
function runExclusive(key, task) {
    const previous = exclusiveTasks.get(key) || Promise.resolve();
    const result = previous.then(task, task);
    const tail = result.catch(() => undefined);
    exclusiveTasks.set(key, tail);
    tail.then(() => {
        if (exclusiveTasks.get(key) === tail)
            exclusiveTasks.delete(key);
    });
    return result;
}
// Names compared case-insensitively, surrounding spaces ignored.
function normalizeFileName(name) {
    return String(name ?? "")
        .normalize("NFC")
        .trim()
        .toLocaleLowerCase();
}
// A directory or a file is designated by its node or by its document model (the id listed by file_in_tree):
// returns the node in both cases, null for anything else.
async function toDocumentaryNode(loaded) {
    if (loaded instanceof spinal_env_viewer_plugin_documentation_service_1.SpinalDocument)
        return (await loaded.getNode()) ?? null;
    return loaded instanceof spinal_env_viewer_graph_service_1.SpinalNode ? loaded : null;
}
// Normalized names being created under a parent (key: parent _server_id), not yet visible in its children.
const pendingChildNames = new Map();
// Reserves names under a directory (or context) so that no two children share the same name.
// Returns, for each requested name, null if it is reserved or the error explaining why it is not
// (409 for a name already used, 400 for an empty name); release()
// must be called once the creation is finished (whatever its result). The pending reservations are
// read before the children are loaded, so a creation that completes during the loading is still seen.
function reserveChildNames(parent, names) {
    const parentKey = parent._server_id;
    return runExclusive(`documentary-names:${parentKey}`, async () => {
        const pending = pendingChildNames.get(parentKey) || new Set();
        const pendingBefore = new Set(pending);
        const children = await parent.getChildren([spinal_env_viewer_plugin_documentation_service_1.TO_FILE_RELATION, spinal_env_viewer_plugin_documentation_service_1.TO_FOLDER_RELATION]);
        const existing = new Set(children.map((child) => normalizeFileName(child.getName().get())));
        const reserved = [];
        const conflicts = names.map((name) => {
            const key = normalizeFileName(name);
            if (!key)
                return { code: 400, message: "Name is empty" };
            if (existing.has(key) || pendingBefore.has(key) || pending.has(key))
                return { code: 409, message: `An item named "${name}" already exists in this directory` };
            if (reserved.includes(key))
                return { code: 409, message: `The name "${name}" is used more than once in the request` };
            reserved.push(key);
            return null;
        });
        for (const key of reserved)
            pending.add(key);
        if (pending.size > 0)
            pendingChildNames.set(parentKey, pending);
        const release = () => {
            for (const key of reserved)
                pending.delete(key);
            if (pending.size === 0 && pendingChildNames.get(parentKey) === pending)
                pendingChildNames.delete(parentKey);
        };
        return { conflicts, release };
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
    for (const parent of parents) {
        // A root directory is replaced by the node(s) owning it; kept as is if no owner is found.
        const owners = isRootDirectoryNode(parent) ? await getRootParents(parent) : [];
        for (const node of owners.length > 0 ? owners : [parent]) {
            const context = isInContext(node, contexts);
            result.push(formatParentNode(node, context));
        }
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
function getRootParents(rootNode) {
    return rootNode.getParents([spinal_env_viewer_plugin_documentation_service_1.TO_ROOT_DIRECTORY_RELATION]);
}
// Same rule as isRootDirectoryNode in spinal-env-viewer-plugin-documentation-service, which the package
// does not export: the root directory of a node's files is the node another node points to through
// "hasFiles", whatever its format ("<name>_root_directory" or the legacy "[Files]" reused when a file
// is linked to that node). Synchronous: reads node.parents without loading anything. Removing a
// relation leaves an empty list, hence the length check.
function isRootDirectoryNode(node) {
    const rootParents = node.parents.getElement(spinal_env_viewer_plugin_documentation_service_1.TO_ROOT_DIRECTORY_RELATION);
    return !!rootParents && rootParents.length > 0;
}
//# sourceMappingURL=index.js.map