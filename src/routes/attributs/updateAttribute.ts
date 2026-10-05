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
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import { getProfileId } from '../../utilities/requestUtilities';
import type { Express } from 'express';
import type { SpinalNode } from 'spinal-env-viewer-graph-service';
import type { NodeAttribut } from '../interface/NodeAttribut';
import type { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/{IdNode}/category/{IdCategory}/attribut/{attributName}/update:
   *   put:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Update an attribute of a node
   *     description: >-
   *       Replaces the label, value, type and unit of one attribute. All four body fields are applied,
   *       so a field left out is written as `undefined` - send the current value for the fields that
   *       should not change. Note that `attributeLabel` renames the attribute.
   *
   *
   *       The attribute is matched by exact label inside the given category. When nothing matches, the
   *       request still answers **200** and simply returns the node's categories unchanged, so compare
   *       the response with what you sent to know whether the update landed.
   *
   *
   *       The response is the full list of attribute categories of the node after the write, not just
   *       the modified attribute.
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
   *         description: Dynamic ID of the category holding the attribute.
   *         required: true
   *         schema:
   *           type: integer
   *           format: int64
   *       - in: path
   *         name: attributName
   *         description: Current label of the attribute to update (exact match).
   *         required: true
   *         schema:
   *           type: string
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
   *                 description: New label. Pass the current one to keep it.
   *               attributeValue:
   *                 type: string
   *               attributeType:
   *                 type: string
   *               attributeUnit:
   *                 type: string
   *     responses:
   *       200:
   *         description: All the attribute categories of the node, as they stand after the write.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/NodeAttribut'
   *       400:
   *         description: The node or the category could not be loaded (body is `ko`).
   *       401:
   *         description: The profile is not allowed to write on this node.
   */

  app.put(
    '/api/v1/node/:IdNode/category/:IdCategory/attribut/:attributName/update',
    async (req, res, next) => {
      try {
        const profileId = getProfileId(req);

        const nodes: NodeAttribut[] = [];
        const node: SpinalNode = await spinalAPIMiddleware.load(
          parseInt(req.params.IdNode, 10),
          profileId
        );
        const category: SpinalNode = await spinalAPIMiddleware.load(
          parseInt(req.params.IdCategory, 10),
          profileId
        );
        const childrens = await node.getChildren(NODE_TO_CATEGORY_RELATION);
        for (const children of childrens) {
          if (children.getId().get() === category.getId().get()) {
            const attributes = await category.getElement();
            for (let index = 0; index < attributes.length; index++) {
              const element = attributes[index];
              if (element.label.get() === req.params.attributName) {
                element.label.set(req.body.attributeLabel);
                element.value.set(req.body.attributeValue);
                element.type.set(req.body.attributeType);
                element.unit.set(req.body.attributeUnit);
                break;
              }
            }
          }
        }

        for (const child of childrens) {
          const attributs = await child.element?.load();
          const info: NodeAttribut = {
            dynamicId: child._server_id!,
            staticId: child.getId().get(),
            name: child.getName().get(),
            type: child.getType().get(),
            attributs: attributs.get(),
          };
          nodes.push(info);
        }
        res.json(nodes);
      } catch (error: any) {
        if (error?.code)
          return res.status(error.code).send({ message: error.message });
        return res.status(400).send('ko');
      }
    }
  );
};
