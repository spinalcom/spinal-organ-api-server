"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const utils_1 = require("../utils");
/**
 * @swagger
 * components:
 *   schemas:
 *     DocumentaryLinkFailure:
 *       type: object
 *       properties:
 *         fileId:
 *           description: Id as sent in filesIds
 *         code:
 *           type: integer
 *           description: Reason as an HTTP code (400 invalid or unsupported document, 401 not accessible, 404 not found, 409 already in the directory)
 *         message:
 *           type: string
 */
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/documentary/file/link_to_node/{contextId}/{parentId}:
     *   post:
     *     security:
     *       - bearerAuth:
     *           - write
     *     tags:
     *       - Documentary
     *     summary: Link existing documents to a directory of a context
     *     description: >
     *       Adds each existing document (file or directory) under the given directory, or at the root of the
     *       context when parentId is the context itself. The document keeps its other parents (it is linked,
     *       not moved). Each document is processed independently: a document already present in the target
     *       directory, a directory linked into itself or one of its sub-directories, a legacy file or an id
     *       that cannot be loaded is reported in "failed" without stopping the others.
     *     parameters:
     *       - in: path
     *         name: contextId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Dynamic id of the documentary context
     *       - in: path
     *         name: parentId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Dynamic id of the target directory, or of the context itself for its root
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - filesIds
     *             properties:
     *               filesIds:
     *                 type: array
     *                 items:
     *                   type: integer
     *                 description: Dynamic ids of the documents to link (document node or document model)
     *           example:
     *             filesIds: [101, 102, 103]
     *     responses:
     *       200:
     *         description: At least one document was linked; the others are listed in "failed"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       fileId:
     *                         type: integer
     *                         description: Id as sent in filesIds
     *                       name:
     *                         type: string
     *                       id:
     *                         type: string
     *                       type:
     *                         type: string
     *                       dynamicId:
     *                         type: integer
     *                         description: Dynamic id of the document node
     *                 failed:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/DocumentaryLinkFailure'
     *       400:
     *         description: >
     *           Invalid parameters, contextId is not a context, parentId is neither the context nor one of its
     *           directories, or no document could be linked (body { message, failed })
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 failed:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/DocumentaryLinkFailure'
     *       401:
     *         description: Context or parent not accessible with this profile
     *       404:
     *         description: Context or parent node not found
     *       500:
     *         description: Internal server error
     */
    app.post("/api/v1/documentary/file/link_to_node/:contextId/:parentId", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const filesIds = req.body?.filesIds;
            if (!Array.isArray(filesIds) || filesIds.length === 0) {
                return res.status(400).send({ message: "filesIds must be a non-empty array" });
            }
            const contextDynamicId = parseInt(req.params.contextId, 10);
            const parentDynamicId = parseInt(req.params.parentId, 10);
            if (isNaN(contextDynamicId))
                return res.status(400).send({ message: "Invalid contextId" });
            if (isNaN(parentDynamicId))
                return res.status(400).send({ message: "Invalid parentId" });
            const contextNode = await spinalAPIMiddleware.load(contextDynamicId, profileId);
            if (!contextNode)
                return res.status(404).send({ message: `No context found with id ${contextDynamicId}` });
            if (!(contextNode instanceof spinal_env_viewer_graph_service_1.SpinalContext))
                return res.status(400).send({ message: `Node ${contextDynamicId} is not a context` });
            const parentNode = await (0, utils_1.toDocumentaryNode)(await spinalAPIMiddleware.load(parentDynamicId, profileId));
            if (!parentNode)
                return res.status(404).send({ message: `No parent node found with id ${parentDynamicId}` });
            const parentIsContext = parentNode._server_id === contextNode._server_id;
            if (!parentIsContext && (parentNode.getType().get() !== spinal_env_viewer_plugin_documentation_service_1.DIRECTORY_NODE_TYPE || !parentNode.belongsToContext(contextNode))) {
                return res.status(400).send({ message: `Node ${parentDynamicId} is neither the context nor one of its directories` });
            }
            const response = { success: [], failed: [] };
            // One document at a time and one request at a time per directory: the "already linked" check and the
            // link must not interleave, otherwise the same document could be added twice.
            await (0, utils_1.runExclusive)(`documentary-link:${parentNode._server_id}`, async () => {
                for (const fileId of filesIds) {
                    try {
                        const linkedNode = await linkDocument(fileId, parentNode, contextNode, profileId);
                        await (0, utils_1.waitUntilServerIdNotDefined)(linkedNode);
                        response.success.push({ fileId, ...linkedNode.info.get(), dynamicId: linkedNode._server_id });
                    }
                    catch (error) {
                        response.failed.push({ fileId, code: error?.code || 400, message: error?.message || "Failed to link file" });
                    }
                }
            });
            if (response.success.length === 0)
                return res.status(400).send({ message: "No file could be linked", failed: response.failed });
            return res.status(200).send(response);
        }
        catch (error) {
            if (error.code)
                return res.status(error.code).send({ message: error.message });
            return res.status(500).send({ message: error.message });
        }
    });
    async function linkDocument(fileId, parentNode, contextNode, profileId) {
        const fileDynamicId = Number(fileId);
        if (!Number.isInteger(fileDynamicId) || fileDynamicId <= 0)
            throw { code: 400, message: `Invalid fileId: ${fileId}` };
        const loaded = await spinalAPIMiddleware.load(fileDynamicId, profileId);
        if (!loaded)
            throw { code: 404, message: `No file found with id ${fileDynamicId}` };
        const { node: fileNode, document } = await getDocument(loaded, fileDynamicId);
        if (parentNode.getChildrenIds().includes(fileNode.getId().get())) {
            throw { code: 409, message: `File ${fileDynamicId} is already in this directory` };
        }
        if (document.isDirectory() && (await isSameOrAncestor(fileNode, parentNode))) {
            throw { code: 400, message: `Directory ${fileDynamicId} cannot be linked into itself or one of its sub-directories` };
        }
        const [linkedNode] = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addFileToNodeInContext(parentNode, fileNode, contextNode).catch((error) => {
            throw { code: 400, message: `Failed to link file ${fileDynamicId} due to: ${error?.message}` };
        });
        if (!linkedNode)
            throw { code: 400, message: `Failed to link file ${fileDynamicId}: no node returned` };
        return linkedNode;
    }
};
// Accepts the node or the model of a document; legacy files (spinal File without versions) are not supported
// by addFileToNodeInContext.
async function getDocument(loaded, fileDynamicId) {
    if (loaded instanceof spinal_env_viewer_graph_service_1.SpinalNode) {
        const type = loaded.getType().get();
        if (type !== spinal_env_viewer_plugin_documentation_service_1.FILE_NODE_TYPE && type !== spinal_env_viewer_plugin_documentation_service_1.DIRECTORY_NODE_TYPE)
            throw { code: 400, message: `Node ${fileDynamicId} is not a document` };
        const document = await loaded.getElement(true);
        if (!(document instanceof spinal_env_viewer_plugin_documentation_service_1.SpinalDocument))
            throw { code: 400, message: `File ${fileDynamicId} uses the legacy format and cannot be linked` };
        return { node: loaded, document };
    }
    if (loaded instanceof spinal_env_viewer_plugin_documentation_service_1.SpinalDocument)
        return { node: await loaded.createNode(), document: loaded };
    throw { code: 400, message: `Item ${fileDynamicId} is not a document or uses the legacy format` };
}
// True if directoryNode is targetNode or one of its ancestors through the directory relations.
async function isSameOrAncestor(directoryNode, targetNode) {
    const directoryId = directoryNode.getId().get();
    const visited = new Set();
    const queue = [targetNode];
    while (queue.length > 0) {
        const node = queue.shift();
        const id = node.getId().get();
        if (id === directoryId)
            return true;
        if (visited.has(id))
            continue;
        visited.add(id);
        queue.push(...(await node.getParents([spinal_env_viewer_plugin_documentation_service_1.TO_FOLDER_RELATION])));
    }
    return false;
}
//# sourceMappingURL=linkFileToNodeInContext.js.map