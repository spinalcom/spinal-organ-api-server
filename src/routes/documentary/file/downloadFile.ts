import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { DIRECTORY_MODEL_TYPE, FILE_NODE_TYPE, serviceDocumentation, SpinalDocument } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-model-graph";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { getHubUrl } from "../utils";
const mime = require("mime-types");

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/file/{fileId}/download:
	 *   get:
	 *     security:
	 *       - bearerAuth:
	 *           - readOnly
	 *     summary: Download the content of a file
	 *     description: >
	 *       Returns the raw content of the file (current version, or the version given by "version"), not JSON.
	 *       Content-Type is deduced from the file name, Content-Disposition is "inline" with the UTF-8 file name
	 *       (filename*), and Content-Length is the size of the content. Use this route instead of
	 *       GET /api/v1/documentary/file/{fileDynamicId}?format=buffer, which sends the bytes as a JSON array.
	 *     tags:
	 *       - Documentary
	 *     parameters:
	 *       - in: path
	 *         name: fileId
	 *         required: true
	 *         description: Dynamic id of the file (document node or file model).
	 *         schema:
	 *           type: integer
	 *           format: int64
	 *       - in: query
	 *         name: version
	 *         required: false
	 *         description: Name of the version to download (as listed by GET /api/v1/documentary/file/{nodeId}/versions). Current version if omitted.
	 *         schema:
	 *           type: string
	 *     responses:
	 *       200:
	 *         description: Content of the file.
	 *         headers:
	 *           Content-Disposition:
	 *             description: inline; filename="<ASCII fallback>"; filename*=UTF-8''<encoded name>
	 *             schema:
	 *               type: string
	 *           Content-Length:
	 *             schema:
	 *               type: integer
	 *         content:
	 *           application/octet-stream:
	 *             schema:
	 *               type: string
	 *               format: binary
	 *       400:
	 *         description: Invalid id, or the id is not a file (directory or other node).
	 *       401:
	 *         description: File not accessible with this profile.
	 *       404:
	 *         description: File or version not found.
	 *       500:
	 *         description: Internal server error.
	 */
	app.get("/api/v1/documentary/file/:fileId/download", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const fileDynamicId = parseInt(req.params.fileId, 10);
			if (isNaN(fileDynamicId)) return res.status(400).send({ message: "Invalid fileId" });

			const fileNode = await spinalAPIMiddleware.load<SpinalNode | SpinalDocument | SpinalFile>(fileDynamicId, profileId);
			if (!fileNode) return res.status(404).send({ message: `No file found with id ${fileDynamicId}` });

			if (fileNode instanceof SpinalNode) {
				if (fileNode.getType().get() !== FILE_NODE_TYPE) return res.status(400).send({ message: `Node ${fileDynamicId} is not a file` });
			} else if (fileNode._info?.model_type?.get() === DIRECTORY_MODEL_TYPE) {
				return res.status(400).send({ message: `Item ${fileDynamicId} is a directory` });
			}

			const fileName: string = fileNode instanceof SpinalNode ? fileNode.getName().get() : (fileNode as any).name.get();
			const hubUrl = getHubUrl(spinalAPIMiddleware);
			const versionName = typeof req.query.version === "string" && req.query.version !== "" ? req.query.version : undefined;

			let data: Buffer;
			if (versionName !== undefined) {
				const version = await serviceDocumentation.getFileVersionByName(fileNode, versionName);
				if (!version) return res.status(404).send({ message: `No version found with name ${versionName}` });
				data = await version.getAsBuffer(hubUrl);
			} else {
				data = (await serviceDocumentation.convertFileToBuffer(fileNode, hubUrl)).buffer;
			}

			res.set({
				"Content-Type": mime.lookup(fileName) || "application/octet-stream",
				"Content-Disposition": getInlineContentDisposition(fileName),
				"Content-Length": String(data.length),
				"Cache-Control": "private, no-cache",
				"X-Content-Type-Options": "nosniff",
			});
			// Let a browser client read the file name (cors() only exposes the headers it is given).
			res.append("Access-Control-Expose-Headers", "Content-Disposition");

			// res.end rather than res.send: no ETag computed on the whole content.
			return res.status(200).end(data);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};

// RFC 6266: ASCII fallback in filename, UTF-8 name in filename* (RFC 5987, where ' ( ) * must be encoded).
function getInlineContentDisposition(fileName: string): string {
	const fallback = fileName.replace(/[^\x20-\x7e]|["\\]/g, "_");
	const encoded = encodeURIComponent(fileName).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
	return `inline; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
