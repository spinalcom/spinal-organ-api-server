/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import * as express from "express";
import { CreateNode } from "../interface/CreateNode";
import { getProfileId } from "../../utilities/requestUtilities";
import { ISpinalAPIMiddleware } from "../../interfaces";
import { SpinalGraphService, SpinalNode, SpinalContext } from "spinal-env-viewer-graph-service";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
   * @swagger
   * /api/v1/node/{id}/delete_file/{fileServerId}:
   *   delete:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Delete a document attached to a node
   *     description: >-
   *       Removes one document from the node's `hasFiles` directory. `fileServerId` is the `dynamicId`
   *       of the file as returned by `/api/v1/node/{id}/file_list` - the ID of the file itself, not of
   *       the node.
   *     tags:
   *       - Nodes
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the node the document hangs on.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - in: path
   *        name: fileServerId
   *        description: Dynamic ID of the document, as returned by `/api/v1/node/{id}/file_list`.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The document was deleted.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: File successfully deleted
   *                 success:
   *                   type: boolean
   *                   example: true
   *       400:
   *         description: >-
   *           No node with this ID ("No node found with id ..."), or no document with this ID
   *           ("No file found with id ...").
   *       401:
   *         description: The profile is not allowed to write on this node.
   *       500:
   *         description: The node could not be loaded or the document could not be removed.
   */

	app.delete("/api/v1/node/:id/delete_file/:fileServerId", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const nodeId = req.params.id;
			const fileId = req.params.fileServerId;
			const node: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(nodeId, 10), profileId);
			const fileNode: SpinalNode<any> = await spinalAPIMiddleware.load(parseInt(fileId, 10), profileId);

			if (!node) {
				return res.status(400).send(`No node found with id ${nodeId}`);
			}

			if (!fileNode) {
				return res.status(400).send(`No file found with id ${fileId}`);
			}

			await serviceDocumentation.unlinkFileFromNode(node, fileNode);

			return res.status(200).send({ message: "File successfully deleted", success: true });

			// 	SpinalGraphService._addNode(node);
			// 	const fileNode = await node.getChildren("hasFiles");
			// 	if (fileNode.length == 0) {
			// 		return res.status(400).send("Node has no files");
			// 	}
			// 	const directory = await fileNode[0].getElement();
			// 	let index = -1;
			// 	for (const [key, value] of Object.entries(directory)) {
			// 		const castedValue: any = value;
			// 		if (castedValue._server_id == fileId) {
			// 			index = parseInt(key);
			// 			break;
			// 		}
			// 	}
			// 	if (index == -1) {
			// 		return res.status(400).send("File not found");
			// 	}
			// 	directory.splice(index, 1);
			// 	return res.status(200).send("File successfully deleted");
		} catch (error: Error | any) {
			if (error.code && error.message) return res.status(error.code).send(error.message);
			res.status(500).send(error.message);
		}
	});
};
