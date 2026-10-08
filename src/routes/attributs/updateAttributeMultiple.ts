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

import * as express from 'express';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalNode } from 'spinal-env-viewer-graph-service';
import { NodeAttributeUpdate } from '../interface/NodeAttributeUpdate';
import { ISpinalAPIMiddleware } from '../../interfaces';
import {
  getProfileId,
  validateArrayRequestLimit,
} from '../../utilities/requestUtilities';

module.exports = function (
  logger: any,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/attribute/update_multiple:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Update attributes on several nodes at once
   *     description: >-
   *       Writes a batch of attributes, addressing each one by node, **category name** and attribute
   *       label - no category dynamic ID here, unlike the single-attribute routes.
   *
   *
   *       The write is an upsert : a category that does not exist on the node is created, and so is an
   *       unknown attribute label. Only the value is written (`attributeNewValue`); the type and unit
   *       of an existing attribute are left untouched.
   *
   *
   *       Entries are applied in order and the first failure aborts the whole request, so a call that
   *       returns 400 may already have written the entries before it. At most 1000 entries per call
   *       (configurable through `MULTIPLE_ROUTE_IDS_LIMIT`).
   *     tags:
   *       - Node Attributs
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               $ref: '#/components/schemas/NodeAttributeUpdate'
   *     responses:
   *       200:
   *         description: Every entry was written (body is `ok`).
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *       400:
   *         description: >-
   *           The body is not an array, it holds more entries than the configured limit, or one of the
   *           nodes could not be loaded or written (body is `ko`).
   *       401:
   *         description: The profile is not allowed to write on one of the nodes.
   */

  app.post('/api/v1/node/attribute/update_multiple', async (req, res, next) => {
    try {
      const profileId = getProfileId(req);
      const nodes: NodeAttributeUpdate[] = req.body;
      const validationError = validateArrayRequestLimit(nodes, 'items');
      if (validationError) {
        return res.status(400).send(validationError);
      }
      for (const nodeUpdate of nodes) {
        const node: SpinalNode = await spinalAPIMiddleware.load(
          nodeUpdate.dynamicId,
          profileId
        );
        for (const categoryUpdate of nodeUpdate.categories) {
          for (const attributeUpdate of categoryUpdate.attributes) {
            await serviceDocumentation.addAttributeByCategoryName(
              node,
              categoryUpdate.categoryName,
              attributeUpdate.attributeLabel,
              attributeUpdate.attributeNewValue
            );
          }
        }
      }
      res.status(200).send('ok');
    } catch (error: any) {
      if (error?.code)
        return res.status(error.code).send({ message: error.message });
      return res.status(400).send('ko');
    }
    // res.json(nodes);
  });
};
