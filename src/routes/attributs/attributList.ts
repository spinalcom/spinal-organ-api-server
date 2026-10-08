/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import { NODE_TO_CATEGORY_RELATION } from "spinal-env-viewer-plugin-documentation-service";
import { getProfileId } from "../../utilities/requestUtilities";
import { getAttributeListInfo } from "../../utilities/getAttributeListInfo";
import type { Express } from "express";
import type { NodeAttribut } from "../interface/NodeAttribut";
import type { ISpinalAPIMiddleware } from "../../interfaces";
import type { SpinalNode } from "spinal-model-graph";

module.exports = function (logger: any, app: Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {
	/**
   * @swagger
   * /api/v1/node/{id}/attributsList:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the attributes of a node (deprecated alias)
   *     description: >-
   *       Kept for backwards compatibility. Identical result to
   *       `/api/v1/node/{id}/attribute_list`, which should be used instead.
   *     deprecated: true
   *     tags:
   *       - Node Attributs
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the node.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The attribute categories of the node.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/NodeAttribut'
   *       400:
   *         description: The node could not be loaded (unknown or stale dynamic ID).
   *       401:
   *         description: The profile is not allowed to read this node.
   */
	//deprecated
	app.get("/api/v1/node/:id/attributsList", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const node = await spinalAPIMiddleware.load<SpinalNode>(parseInt(req.params.id, 10), profileId);
			const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);
			const prom = childrens.map(async (child): Promise<NodeAttribut> => {
				const attributs = await child.element?.load();
				const info: NodeAttribut = {
					dynamicId: child._server_id!,
					staticId: child.getId().get(),
					name: child.getName().get(),
					type: child.getType().get(),
					attributs: attributs?.get(),
				};
				return info;
			});
			const json = await Promise.all(prom);
			return res.json(json);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(400).send(error.message);
		}
	});

	/**
   * @swagger
   * /api/v1/node/{id}/attribute_list:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     summary: List the attributes of a node
   *     description: >-
   *       Returns the attribute categories attached to a node, each with its attributes. Attributes are
   *       always grouped by category in Spinal, so the response is one entry per category, holding the
   *       category's own `dynamicId` / `staticId` / `name` and its `attributs` array
   *       (`label`, `value`, `type`, `unit`).
   *
   *
   *       The category `dynamicId` is what the create / update / delete attribute routes expect as
   *       `IdCategory`.
   *     tags:
   *       - Node Attributs
   *     parameters:
   *      - in: path
   *        name: id
   *        description: Dynamic ID of the node.
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *     responses:
   *       200:
   *         description: The attribute categories of the node (an empty array if it has none).
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                $ref: '#/components/schemas/NodeAttribut'
   *       400:
   *         description: The node could not be loaded (unknown or stale dynamic ID).
   *       401:
   *         description: The profile is not allowed to read this node.
   */

	app.get("/api/v1/node/:id/attribute_list", async (req, res, next) => {
		try {
			const profileId = getProfileId(req);
			const result = await getAttributeListInfo(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10));
			return res.json(result);
		} catch (error: any) {
			if (error.code) return res.status(error.code).send({ message: error.message });
			return res.status(400).send(error.message);
		}
	});
};
