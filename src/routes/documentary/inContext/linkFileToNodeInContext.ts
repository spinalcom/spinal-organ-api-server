import type { Express } from "express";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalNode } from "spinal-model-graph";

type FileLinkResponse = {
	success: {
		fileId: number;
		name: string;
		id: string;
		type: string;
		dynamicId: number;
	}[];
	failed: {
		fileId: number;
		message: string;
	}[];
};

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
	 * @swagger
	 * /api/v1/documentary/file/link_to_node/{contextId}/{parentId}:
	 *   post:
	 *     tags:
	 *       - Documentary
	 *     summary: Link one or more files to a node in a context
	 *     description: Links each file node to the given parent node within the specified context.
	 *     parameters:
	 *       - in: path
	 *         name: contextId
	 *         required: true
	 *         schema:
	 *           type: integer
	 *         description: Dynamic id of the context node
	 *       - in: path
	 *         name: parentId
	 *         required: true
	 *         schema:
	 *           type: integer
	 *         description: Dynamic id of the parent node
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
	 *                 description: List of file dynamic ids to link
	 *           example:
	 *             filesIds: [101, 102, 103]
	 *     responses:
	 *       200:
	 *         description: Files processed for linking
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
	 *                       name:
	 *                         type: string
	 *                       id:
	 *                         type: string
	 *                       type:
	 *                         type: string
	 *                       dynamicId:
	 *                         type: integer
	 *                 failed:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       fileId:
	 *                         type: integer
	 *                       message:
	 *                         type: string
	 *       400:
	 *         description: Invalid input data
	 *       404:
	 *         description: Context, parent or file node not found
	 *       500:
	 *         description: Internal server error
	 */
	app.post("/api/v1/documentary/file/link_to_node/:contextId/:parentId", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const filesIds = req.body.filesIds;
			if (!Array.isArray(filesIds) || filesIds.length === 0) {
				return res.status(400).send({ message: "filesIds must be a non-empty array" });
			}

			const contextDynamicId = parseInt(req.params.contextId, 10);
			const parentDynamicId = parseInt(req.params.parentId, 10);

			if (isNaN(contextDynamicId)) return res.status(400).send({ message: "Invalid contextId" });
			if (isNaN(parentDynamicId)) return res.status(400).send({ message: "Invalid parentId" });

			const contextNode = await spinalAPIMiddleware.load<SpinalNode>(contextDynamicId, profileId);
			if (!contextNode) return res.status(404).send({ message: `No context found with id ${contextDynamicId}` });

			const parentNode = await spinalAPIMiddleware.load<SpinalNode>(parentDynamicId, profileId);
			if (!parentNode) return res.status(404).send({ message: `No parent node found with id ${parentDynamicId}` });

			const promises = filesIds.map(async (fileDynamicId: number) => {
				if (isNaN(fileDynamicId)) {
					throw { code: 400, message: `Invalid fileId: ${fileDynamicId}` };
				}

				const fileNode = await spinalAPIMiddleware.load<SpinalNode>(fileDynamicId, profileId);
				if (!fileNode) {
					throw { code: 404, message: `No file found with id ${fileDynamicId}` };
				}

				return serviceDocumentation.addFileToNodeInContext(contextNode, parentNode, fileNode).catch((error: any) => {
					throw { code: 400, message: `Failed to link file ${fileDynamicId} due to: ${error.message}` };
				});
			});

			const results = await Promise.allSettled(promises);

			const response: FileLinkResponse = { success: [], failed: [] };

			for (let index = 0; index < results.length; index++) {
				const fileId = filesIds[index];
				const promResult = results[index];
				if (promResult.status === "rejected") {
					response.failed.push({ fileId, message: promResult.reason?.message || "Failed to link file" });
					continue;
				}

				const [nodeInfo] = promResult.value;
				if (!nodeInfo) {
					response.failed.push({ fileId, message: "No node returned" });
					continue;
				}

				response.success.push({
					fileId,
					...nodeInfo.info.get(),
					dynamicId: nodeInfo._server_id,
				});
			}

			return res.status(200).send(response);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(500).send({ message: error.message });
		}
	});
};
