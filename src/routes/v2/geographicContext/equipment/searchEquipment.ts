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
import type { ISpinalAPIMiddleware } from '../../../../interfaces';
import type { Express } from 'express';
import { getProfileId } from '../../../../utilities/requestUtilities';
import { parseAttributesQuery } from '../../../../utilities/v2/requestParse/parseAttributesQuery';
import { getNodeData } from '../../../../utilities/v2/node/getNodeData';
import { parseInfoQuery } from '../../../../utilities/v2/requestParse/parseInfoQuery';
import { sendResponseError } from '../../../../utilities/v2/errorHandler/sendResponseError';
import { parseFilterQuery } from '../../../../utilities/v2/requestParse/parseFilterQuery';
import { filterNodes } from '../../../../utilities/v2/node/filterNodes';
import { groupPageByParent } from '../../../../utilities/v2/node/groupByParent';
import { getBuildingNode } from '../../../../utilities/v2/geographicContext/getBuilding';
import { findEquipmentNodes } from '../../../../utilities/v2/geographicContext/findEquipmentNodes';
import { parentDynamicIdsBodySchema } from '../../../../utilities/v2/requestParse/parseParentDynIdList';

const searchEquipmentSchema = z.strictObject({
  info: z.string().optional(),
  attributes: z.string().optional(),
  addAttributesModificationDate: z.boolean().optional(),
  parentDynamicIds: parentDynamicIdsBodySchema.optional(),
  bimObjectType: z
    .enum(['bimobject', 'referenceRoom', 'referenceFloor'])
    .optional()
    .default('bimobject'),
  filter: z.union([z.record(z.string(), z.unknown()), z.string()]).optional(),
  offset: z.number().int().min(0).optional().default(0),
  groupByParent: z.boolean().optional().default(true),
});

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/equipment/search:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Search equipment
   *     description: |-
   *       Same behaviour as `GET /api/v2/equipment`, with options sent in a JSON body.
   *       Use this endpoint when the list of parents is too long for a query string.
   *
   *       - `parentDynamicIds` is an array of 1 to 50 parent dynamic IDs. Duplicates are ignored.
   *       - Omit `parentDynamicIds` to traverse the profile's building (not recommended for large buildings).
   *       - Filters use **AND**, run **before** `offset`, and return at most **200 matching items**.
   *       - Each item includes `parentDynamicId`.
   *       - With `parentDynamicIds`, `total` counts eligible children **before filtering** across all parents.
   *       - With `groupByParent: true`, the response returns `groups` instead of `data`: one entry per parent that has items in the page, in parent input order. Paging is still global, so a parent's items can continue on the next page. An equipment item linked to two parents appears in both groups.
   *     tags:
   *       - geographicContext
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             additionalProperties: false
   *             properties:
   *               info:
   *                 type: string
   *                 description: Same format as the `info` query parameter.
   *                 example: name,type
   *               attributes:
   *                 type: string
   *                 description: Same format as the `attributes` query parameter.
   *               addAttributesModificationDate:
   *                 type: boolean
   *               parentDynamicIds:
   *                 type: array
   *                 minItems: 1
   *                 maxItems: 50
   *                 items:
   *                   type: integer
   *                   minimum: 1
   *                 example: [132456, 132457]
   *               bimObjectType:
   *                 type: string
   *                 enum: ['bimobject', 'referenceRoom', 'referenceFloor']
   *                 default: 'bimobject'
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
   *               groupByParent:
   *                 type: boolean
   *                 default: true
   *                 description: Return `groups` (one per parent) by default. Set to `false` to get a flat `data` array.
   *     responses:
   *       200:
   *         $ref: '#/components/responses/INodeItemAttrMultiRes'
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   *       500:
   *         $ref: '#/components/responses/IErrorItemRes500'
   */
  app.post(
    '/api/v2/equipment/search',
    validate({ body: searchEquipmentSchema }),
    async (req, res) => {
      try {
        const {
          info,
          attributes,
          addAttributesModificationDate,
          parentDynamicIds,
          bimObjectType,
          filter,
          offset,
          groupByParent,
        } = req.body;
        const parsedInfoQuery = parseInfoQuery(info);
        const parsedAttrQuery = parseAttributesQuery(attributes);
        const filters = parseFilterQuery({ filter });
        const profileId = getProfileId(req);
        const { geographicContext, building } = await getBuildingNode(
          spinalAPIMiddleware,
          profileId,
          false
        );
        const foundNodes = await findEquipmentNodes({
          spinalAPIMiddleware,
          profileId,
          geographicContext,
          building,
          bimObjectType,
          parentDynamicIds,
        });

        const page = await filterNodes(foundNodes, filters, offset);
        const equipmentData = await Promise.all(
          page.map(({ node, parentId }) =>
            getNodeData(
              node,
              parsedInfoQuery,
              parsedAttrQuery,
              addAttributesModificationDate,
              parentId
            )
          )
        );
        const total = Array.isArray(foundNodes) ? foundNodes.length : undefined;
        if (groupByParent) {
          return res.status(200).json({
            groups: groupPageByParent(page, equipmentData),
            offset,
            total,
          });
        }
        return res.status(200).json({
          data: equipmentData,
          offset,
          total,
        });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
