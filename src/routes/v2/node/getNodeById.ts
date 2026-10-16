/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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

import { z } from 'zod';
import validate from 'express-zod-safe';
import type { Express } from 'express';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { getProfileId } from '../../../utilities/requestUtilities';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';
import { parseAttributesQuery } from '../../../utilities/v2/requestParse/parseAttributesQuery';
import { parseInfoQuery } from '../../../utilities/v2/requestParse/parseInfoQuery';
import { getNodeData } from '../../../utilities/v2/node/getNodeData';
import { sendResponseError } from '../../../utilities/v2/errorHandler/sendResponseError';
import { parseElementQuery } from '../../../utilities/v2/node/getNodeElement';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/node/{nodeId}:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Retrieve a node by its dynamic ID
   *     description: |-
   *       Load any `SpinalNode` using its dynamic ID and the current profile.
   *       No geographic type or parent relation is required.
   *
   *       ### Output
   *       - Returns `{ data: INodeItem }`, without traversing children.
   *       - Select fields using `info` and `attributes`.
   *       - Omitting `info` returns the default info projection; `info=false` omits info and `info=true` returns all info, including nested objects and arrays. Use dot paths such as `info=metadata.unit,samples.0` to select nested values.
   *       - Attributes are omitted by default. Use `attributes=true` for all attributes, or select categories/attributes.
   *       - Element contents are omitted unless requested with `element`.
   *
   *       ### Element selection
   *       - `element=true` returns the whole element; omitted or `false` does not load it.
   *       - Select comma-separated dot paths, for example `element=value,metadata.unit,samples.0`.
   *       - Selected paths preserve their structure. Array indexes are zero-based; unselected earlier entries appear as `null`.
   *       - A missing element returns `element: null` without creating one. Missing fields are omitted.
   *       - Directly embedded Models are traversed; nested pointers are not loaded and return `{ "$ptr": dynamicId }` (or `null` for an unset pointer ID).
   *       - Dot paths cannot address field names containing dots. Internal Model members are not selectable.
   *       - Cycles, non-finite numbers, serialization exceeding depth 32 or 10000 visited Models, or arrays longer than 10000 return HTTP 500. Select narrower paths to avoid unrelated branches.
   *
   *       ### Errors
   *       - **400:** invalid request, loading failure, or the loaded model is not a `SpinalNode`.
   *       - **500:** unexpected internal error.
   *     tags:
   *       - node
   *     parameters:
   *       - name: nodeId
   *         in: path
   *         required: true
   *         description: Dynamic ID of the SpinalNode.
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 9007199254740991
   *       - $ref: '#/components/parameters/queryInfo'
   *       - $ref: '#/components/parameters/queryAttributes'
   *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
   *       - $ref: '#/components/parameters/queryElement'
   *     responses:
   *       200:
   *         description: Requested node with the selected info and attributes.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required: [data]
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/INodeItem'
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   *       500:
   *         $ref: '#/components/responses/IErrorItemRes500'
   */
  app.get(
    '/api/v2/node/:nodeId',
    validate({
      params: z.strictObject({
        nodeId: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
      }),
      query: z.strictObject({
        info: z.coerce.string().optional(),
        attributes: z.coerce.string().optional(),
        element: z.string().optional(),
        'add-attributes-modification-date': z.stringbool().optional(),
      }),
    }),
    async (req, res) => {
      try {
        const parsedInfoQuery = parseInfoQuery(req.query.info);
        const parsedAttrQuery = parseAttributesQuery(req.query.attributes);
        const parsedElementQuery = parseElementQuery(req.query.element);
        const node = await loadAndValidateNode(
          spinalAPIMiddleware,
          req.params.nodeId,
          getProfileId(req)
        );
        const data = await getNodeData(
          node,
          parsedInfoQuery,
          parsedAttrQuery,
          req.query['add-attributes-modification-date'],
          undefined,
          parsedElementQuery
        );
        return res.status(200).json({ data });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
