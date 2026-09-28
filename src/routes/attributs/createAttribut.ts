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
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import type {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import type { Express } from 'express';
import type { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from '../../utilities/requestUtilities';
import { awaitSync } from '../../utilities/awaitSync';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{IdNode}/category/{IdCategory}/attribut/create:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Add an attribute to a category of a node
   *     description: >-
   *       Adds an attribute inside one of the node's existing attribute categories. The category is
   *       given by its dynamic ID and **must already be attached to that node** - otherwise the request
   *       fails with 400. Create a category first with `/api/v1/node/{id}/category/create` if
   *       needed.
   *
   *
   *       The attribute is added by category *name*, so if the node holds several categories with the
   *       same name the attribute lands in the first one. An attribute with the same label is
   *       overwritten rather than duplicated. The route waits for the hub to acknowledge the write
   *       before answering, so the returned `id` is usable right away.
   *     tags:
   *       - Node Attributs
   *     parameters:
   *       - in: path
   *         name: IdNode
   *         description: Dynamic ID of the node.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: IdCategory
   *         description: Dynamic ID of the category, as returned by `/api/v1/node/{id}/attribute_list`.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - attributeLabel
   *               - attributeValue
   *               - attributeType
   *               - attributeUnit
   *             properties:
   *               attributeLabel:
   *                 type: string
   *                 description: Name of the attribute; it is also its key inside the category.
   *               attributeValue:
   *                 type: string
   *               attributeType:
   *                 type: string
   *                 description: Free-text type of the attribute (for instance `string`, `number`, `boolean`).
   *               attributeUnit:
   *                 type: string
   *     responses:
   *       200:
   *         description: The attribute was created.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                   description: The label that was given to the attribute.
   *                 id:
   *                   type: integer
   *                   format: int64
   *                   description: Dynamic ID of the created attribute.
   *       400:
   *         description: >-
   *           The category is not one of the node's categories ("Category not found in the node
   *           categories list"), the write failed ("Creation failed"), or the node or category could
   *           not be loaded.
   *       401:
   *         description: The profile is not allowed to write on this node.
   */

  app.post(
    '/api/v1/node/:IdNode/category/:IdCategory/attribut/create',
    async (req, res, next) => {
      try {
        const profileId = getProfileId(req);

        const node: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.IdNode, 10),
          profileId
        );
        //@ts-ignore
        SpinalGraphService._addNode(node);
        const category: SpinalNode<any> = await spinalAPIMiddleware.load(
          parseInt(req.params.IdCategory, 10),
          profileId
        );
        //@ts-ignore
        SpinalGraphService._addNode(category);
        const attributeLabel = req.body.attributeLabel;
        const attributeValue = req.body.attributeValue;
        const attributeType = req.body.attributeType;
        const attributeUnit = req.body.attributeUnit;

        const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);

        for (const children of childrens) {
          if (children.getId().get() === category.getId().get()) {
            const createdAttribute =
              await serviceDocumentation.addAttributeByCategoryName(
                node,
                category.getName().get(),
                attributeLabel,
                attributeValue,
                attributeType,
                attributeUnit
              );
            if (createdAttribute === undefined) {
              return res.status(400).send('Creation failed');
            }
            await awaitSync(createdAttribute);
            return res.status(200).json({
              name: attributeLabel,
              id: createdAttribute._server_id,
            });
          }
        }
        return res
          .status(400)
          .send('Category not found in the node categories list');
      } catch (error: any) {
        if (error.code)
          return res.status(error.code).send({ message: error.message });
        return res.status(400).send(error.message);
      }
    }
  );
};
