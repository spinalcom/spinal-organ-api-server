/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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

import { SpinalContext, SpinalNode, SpinalGraphService } from "spinal-env-viewer-graph-service";
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import * as express from "express";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
// import getFiles from "../../../utilities/getFiles";
import { getProfileId } from "../../../utilities/requestUtilities";
import { ISpinalAPIMiddleware } from "../../../interfaces";
import { ServiceDocumentation } from "spinal-env-viewer-plugin-documentation-service";

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
   * @swagger
   * /api/v1/equipement/{id}/file_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the documents attached to an equipment
   *     description: >-
   *       Returns the documents stored under the equipment's `hasFiles` child as `{ dynamicId, Name }`.
   *       Use the returned `dynamicId` with `/api/v1/node/{id}/download_file`. The node must be of type
   *       `BIMObject`.
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the equipment (a `BIMObject`).
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The requested list (empty when there is nothing).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/File'
   *       400:
   *         description: The node is not a `BIMObject`, or its documents could not be read (body is `ko`).
   *       401:
   *         description: The profile is not allowed to read this equipment.
   */
	app.get("/api/v1/equipement/:id/file_list", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);

			const equipement = await spinalAPIMiddleware.load<SpinalNode>(parseInt(req.params.id, 10), profileId);

			if (!equipement) {
				res.status(400).send({ message: `No equipement found with ID ${req.params.id}` });
				return;
			}

			if (equipement.getType().get() !== "BIMObject") {
				res.status(400).send({ message: `Node with ID ${req.params.id} is not of type BIMObject` });
				return;
			}

			SpinalGraphService._addNode(equipement);
			const files = await serviceDocumentation.getFileLinkedToNode(equipement);

			const filesFormatted = files.map((file) => ({
				dynamicId: file._server_id,
				Name: file?.info?.name?.get() || file.name?.get(),
			}));

			return res.json(filesFormatted);

			// if (equipement.getType().get() === "BIMObject") {
			// 	// Files
			// 	var _files = [];
			// 	const fileNode = (await equipement.getChildren("hasFiles"))[0];
			// 	if (fileNode) {
			// 		const filesfromElement = await fileNode.element.load();
			// 		for (let index = 0; index < filesfromElement.length; index++) {
			// 			const infoFiles = {
			// 				dynamicId: filesfromElement[index]._server_id,
			// 				Name: filesfromElement[index].name.get(),
			// 			};
			// 			_files.push(infoFiles);
			// 		}
			// 	}
			// } else {
			// 	res.status(400).send("node is not of type  BIMObject");
			// }
		} catch (error: Error | any) {
			if (error.code && error.message) return res.status(error.code).send(error.message);
			res.status(400).send("ko");
		}
	});
};
