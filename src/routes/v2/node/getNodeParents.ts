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
   * /api/v2/node/{nodeId}/parents:
   *   get:
   *     security:
   *       - bearerAuth: [read]
   *     tags: [node]
   *     summary: List distinct direct parents
   *     description: |-
   *       Follow incoming relations only, without recursive traversal.
   *
   *       - Relation names retain their original parent-to-child meaning.
   *       - Comma-separated relation names match with **OR**; type and context selectors combine with **AND**.
   *       - Filters and projections apply to the returned parents. Items omit `parentDynamicId`.
   *       - Source, context and returned parent loads use the current profile; inaccessible loads fail the request.
   *       - With `contextDynamicId`, the queried child, relation and returned parent must belong to that context.
   *       - Incoming relation pointers must be loaded to check context membership, but parents of unrelated relations are not fetched.
   *       - Parents are deduplicated by static ID before filtering and pagination.
   *       - Filters run before `offset`; each page contains at most **200 matching distinct nodes**.
   *       - `total` is the number returned in this page. Graph traversal ordering may shift under concurrent changes.
   *       - No matches returns `data: []`.
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
   *         description: Page of distinct direct parents.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required: [data, offset, total]
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/INodeItem'
   *                 offset:
   *                   type: integer
   *                 total:
   *                   type: integer
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   *       500:
   *         $ref: '#/components/responses/IErrorItemRes500'
   */
  app.get(
    '/api/v2/node/:nodeId/parents',
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
              false,
              'parents'
            )
          );
      } catch (error) {
        sendResponseError(res, error);
      }
    }
  );
};
