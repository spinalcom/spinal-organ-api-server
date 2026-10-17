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
import { createErrorMsgItem } from '../../../utilities/v2/errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../../utilities/v2/errorHandler/EApiErrorType';
import { sendResponseError } from '../../../utilities/v2/errorHandler/sendResponseError';
import { childAttachmentSchema } from '../../../utilities/v2/node/relationships/schemas';
import { attachChildren } from '../../../utilities/v2/node/relationships/attachChildren';

module.exports = function (
  logger: any,
  app: Express,
  middleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/node/{parentId}/children:
   *   post:
   *     security:
   *       - bearerAuth: [write]
   *     tags: [node]
   *     summary: Attach existing children to a node
   *     description: |-
   *       Attach existing SpinalNodes; no nodes are created.
   *       The current profile must have access to the parent, each child and any supplied context.
   *
   *       - `relationType` defaults to `PtrLst`; `LstPtr` and `Ref` are also supported.
   *       - With `contextDynamicId`, the target must be a SpinalContext and attachment uses `addChildInContext`.
   *       - Without a context, attachment uses `addChild`.
   *       - An existing edge with the requested context membership (if supplied) is a successful no-op.
   *       - An existing edge missing the requested context membership is rejected with HTTP 400 for that entry; this endpoint does not change context membership on existing edges.
   *       - Entries run in request order. Successful attachments are retained if other entries fail.
   *       - HTTP 200 returns successful entries in `data`, with `attached` or `alreadyAttached` status, and optional per-entry failures in `error`.
   *       - If all entries fail, HTTP 400 is returned, or 500 if any failure is internal. The `errors` array identifies each failed entry.
   *       - Writes are not transactional and concurrent requests are not locked.
   *     parameters:
   *       - name: parentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 9007199254740991
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             additionalProperties: false
   *             required: [children]
   *             properties:
   *               children:
   *                 type: array
   *                 minItems: 1
   *                 items:
   *                   $ref: '#/components/schemas/INodeChildAttachment'
   *           example:
   *             children:
   *               - childDynamicId: 123456
   *                 relationName: hasSensor
   *                 contextDynamicId: 654321
   *               - childDynamicId: 123457
   *                 relationName: hasSensor
   *                 relationType: PtrLst
   *     responses:
   *       200:
   *         description: At least one successful attachment or already-attached entry.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required: [data]
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/INodeChildAttachmentResult'
   *                 error:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/INodeChildAttachmentError'
   *       400:
   *         description: Invalid request or parent, or all children failed validation/attachment. Batch failures include errors.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/INodeChildrenFailure'
   *       500:
   *         description: Unexpected failure, or all entries failed with at least one internal error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/INodeChildrenFailure'
   */
  app.post(
    '/api/v2/node/:parentId/children',
    validate({
      params: z.strictObject({
        parentId: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
      }),
      body: z.strictObject({ children: z.array(childAttachmentSchema).min(1) }),
    }),
    async (req, res) => {
      try {
        const { data, errors } = await attachChildren(
          middleware,
          getProfileId(req),
          req.params.parentId,
          req.body.children
        );
        if (!data.length) {
          const internal = errors.some(
            (item) => item.errorType === EApiErrorType.INTERNAL_ERROR
          );
          return res.status(internal ? 500 : 400).json({
            ...createErrorMsgItem(
              internal
                ? EApiErrorType.INTERNAL_ERROR
                : EApiErrorType.INVALID_REQUEST,
              'No child attachment succeeded'
            ),
            errors,
          });
        }
        return res
          .status(200)
          .json({ data, error: errors.length ? errors : undefined });
      } catch (error) {
        sendResponseError(res, error);
      }
    }
  );
};
