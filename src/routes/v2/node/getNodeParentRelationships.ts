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
import {
  relationsQuerySchema,
  listNodeRelations,
} from '../../../utilities/v2/node/listNodeRelations';
import { sendResponseError } from '../../../utilities/v2/errorHandler/sendResponseError';

module.exports = function (
  logger: any,
  app: Express,
  middleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/node/{nodeId}/parent-relationships:
   *   get:
   *     security:
   *       - bearerAuth: [read]
   *     tags: [node]
   *     summary: List incoming parents grouped by relation type and name
   *     description: |-
   *       Returns `data[relationType][relationName]` as arrays of parent `INodeItem`.
   *
   *       - Only direct incoming relationships are inspected. Relation names retain their original parent-to-child meaning.
   *       - A parent appears in each selected incoming relation containing the queried child.
   *       - Selectors, parent filters/projections, access checks and context membership work as on GET parents.
   *       - Returned items omit `parentDynamicId`; `nodeDynamicId` identifies the queried child.
   *       - Pagination is global: filter occurrences, skip `offset`, take at most **200**, then group.
   *       - `total` counts returned occurrences, not unique parents or all matches. Groups can span pages.
   *       - Ordering follows graph traversal and may shift under concurrent changes.
   *       - Empty groups are omitted; no matches returns `data: {}`.
   *     parameters:
   *       - $ref: '#/components/parameters/nodeRelationsNodeId'
   *       - $ref: '#/components/parameters/nodeChildrenRelationType'
   *       - $ref: '#/components/parameters/nodeChildrenRelationName'
   *       - $ref: '#/components/parameters/nodeParentsContext'
   *       - $ref: '#/components/parameters/queryInfo'
   *       - $ref: '#/components/parameters/queryAttributes'
   *       - $ref: '#/components/parameters/queryElement'
   *       - $ref: '#/components/parameters/queryFilter'
   *       - $ref: '#/components/parameters/queryOffset'
   *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
   *     responses:
   *       200:
   *         description: Global page of incoming relationship occurrences grouped by type and name.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required: [nodeDynamicId, data, offset, total]
   *               properties:
   *                 nodeDynamicId:
   *                   type: integer
   *                 offset:
   *                   type: integer
   *                 total:
   *                   type: integer
   *                 data:
   *                   type: object
   *                   additionalProperties:
   *                     type: object
   *                     additionalProperties:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/INodeItem'
   *             examples:
   *               grouped:
   *                 $ref: '#/components/examples/parentRelationshipsGrouped'
   *               projected:
   *                 $ref: '#/components/examples/parentRelationshipsProjected'
   *               empty:
   *                 $ref: '#/components/examples/parentRelationshipsEmpty'
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   *       500:
   *         $ref: '#/components/responses/IErrorItemRes500'
   */
  app.get(
    '/api/v2/node/:nodeId/parent-relationships',
    validate({
      params: z.strictObject({
        nodeId: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
      }),
      query: relationsQuerySchema,
    }),
    async (req, res) => {
      try {
        return res
          .status(200)
          .json(
            await listNodeRelations(
              middleware,
              getProfileId(req),
              req.params.nodeId,
              req.query,
              true,
              'parents'
            )
          );
      } catch (error) {
        sendResponseError(res, error);
      }
    }
  );
};
