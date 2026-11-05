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

import { z } from 'zod';
import validate from 'express-zod-safe';
import type { Express } from 'express';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { getProfileId } from '../../../utilities/requestUtilities';
import { sendResponseError } from '../../../utilities/v2/errorHandler/sendResponseError';
import { parentDynamicIdsBodySchema } from '../../../utilities/v2/requestParse/parseParentDynIdList';
import { listNodeChildrenBatch } from '../../../utilities/v2/node/listNodeChildrenBatch';

const searchNodeChildrenSchema = z.strictObject({
  parentIds: parentDynamicIdsBodySchema,
  relationType: z.enum(['PtrLst', 'LstPtr', 'Ref']).optional(),
  relationNames: z.array(z.string().trim().min(1)).min(1).optional(),
  contextDynamicId: z
    .number()
    .int()
    .min(1)
    .max(Number.MAX_SAFE_INTEGER)
    .optional(),
  info: z.string().optional(),
  attributes: z.string().optional(),
  element: z.string().optional(),
  addAttributesModificationDate: z.boolean().optional(),
  filter: z.union([z.record(z.string(), z.unknown()), z.string()]).optional(),
  offset: z
    .number()
    .int()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .optional()
    .default(0),
});

module.exports = function (
  logger: any,
  app: Express,
  middleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/node/children/search:
   *   post:
   *     security:
   *       - bearerAuth: [read]
   *     summary: List distinct direct children of several parents
   *     description: |-
   *       Batch version of `GET /api/v2/node/{parentId}/children`, with options sent in a JSON body.
   *
   *       - `parentIds` is required: an array of 1 to 50 parent dynamic IDs. Duplicate IDs are ignored.
   *       - Relation type/name and context selectors restrict traversal, as on GET children. `relationNames` is an array here, not a comma-separated string.
   *       - Children are deduplicated **per parent**. A child under two parents appears once under each, with its own `parentDynamicId`.
   *       - Filters use **AND**, run **before** `offset`, and return at most **200 matching items** per page.
   *       - Parents are processed in input order; any load failure fails the whole request.
   *       - `total` is the number of items returned in this page.
   *     tags:
   *       - node
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [parentIds]
   *             additionalProperties: false
   *             properties:
   *               parentIds:
   *                 type: array
   *                 minItems: 1
   *                 maxItems: 50
   *                 items:
   *                   type: integer
   *                   minimum: 1
   *                 example: [132456, 132457]
   *               relationType:
   *                 type: string
   *                 enum: ['PtrLst', 'LstPtr', 'Ref']
   *               relationNames:
   *                 type: array
   *                 minItems: 1
   *                 items:
   *                   type: string
   *                 example: ['hasEquipment']
   *               contextDynamicId:
   *                 type: integer
   *                 minimum: 1
   *               info:
   *                 type: string
   *                 description: Same format as the `info` query parameter.
   *                 example: name,type
   *               attributes:
   *                 type: string
   *                 description: Same format as the `attributes` query parameter.
   *               element:
   *                 type: string
   *                 description: Same format as the `element` query parameter.
   *               addAttributesModificationDate:
   *                 type: boolean
   *               filter:
   *                 type: object
   *                 description: Same filter object as the `filter` query parameter.
   *                 example:
   *                   attributes.Geometry.Surface:
   *                     exists: true
   *               offset:
   *                 type: integer
   *                 minimum: 0
   *                 default: 0
   *     responses:
   *       200:
   *         description: Child nodes retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/INodeItem'
   *                 offset:
   *                   type: integer
   *                 total:
   *                   type: integer
   *                   description: Number of items in this page (after filters and offset).
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   *       500:
   *         $ref: '#/components/responses/IErrorItemRes500'
   */
  app.post(
    '/api/v2/node/children/search',
    validate({ body: searchNodeChildrenSchema }),
    async (req, res) => {
      try {
        const {
          parentIds,
          relationType,
          relationNames,
          contextDynamicId,
          info,
          attributes,
          element,
          addAttributesModificationDate,
          filter,
          offset,
        } = req.body;
        return res.status(200).json(
          await listNodeChildrenBatch(middleware, getProfileId(req), {
            parentIds,
            relationType,
            relationNames,
            contextDynamicId,
            info,
            attributes,
            element,
            addAttributesModificationDate,
            filter,
            offset,
          })
        );
      } catch (error) {
        sendResponseError(res, error);
      }
    }
  );
};
