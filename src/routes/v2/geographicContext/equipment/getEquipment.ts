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
import { getBuildingNode } from '../../../../utilities/v2/geographicContext/getBuilding';
import { findEquipmentNodes } from '../../../../utilities/v2/geographicContext/findEquipmentNodes';
import { parentDynamicIdsQuerySchema } from '../../../../utilities/v2/requestParse/parseParentDynIdList';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/equipment:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Retrieve equipment
   *     description: |-
   *       Retrieve equipment from the profile's building or from a supplied parent.
   *
   *       > **Performance recommendation:** provide `parent-dynamic-id`.
   *       > Running this endpoint without it is **not recommended**, especially for large buildings,
   *       > because it may traverse many floors, rooms and equipment nodes. Filters and the
   *       > 200-item page limit do not guarantee a small traversal.
   *       >
   *       > `parent-dynamic-id` accepts a comma-separated list. For a JSON body, use `POST /api/v2/equipment/search`.
   *
   *       ### Scope
   *
   *       - `bimobject`: regular equipment under a `geographicRoom`.
   *       - `referenceRoom`: reference objects under a `geographicRoom`.
   *       - `referenceFloor`: reference objects under a `geographicFloor`.
   *       - A `BIMObjectGroup` parent supports every `bimObjectType`.
   *
   *       ### Filtering and pagination
   *
   *       - All filter conditions use **AND**.
   *       - Filtering runs **before** `offset` and output projection.
   *       - Returns at most **200 matching items**. Use `offset=200` for the second page.
   *
   *       ### Response
   *
   *       - Each item includes `parentDynamicId`.
   *       - Equipment linked to multiple rooms may appear once per room.
   *       - With a parent parameter, `total` counts eligible children **before filtering**.
   *       - `total` is omitted for building-wide traversal.
   *
   *       ### Example
   *
   *       ```http
   *       GET /api/v2/equipment?parent-dynamic-id=132456&filter[attributes.Geometry.Surface][exists]=true&offset=0
   *       ```
   *     tags:
   *       - geographicContext
   *     parameters:
   *       - $ref: '#/components/parameters/queryInfo'
   *       - $ref: '#/components/parameters/queryAttributes'
   *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
   *       - $ref: '#/components/parameters/paramParentDynId'
   *       - in: query
   *         name: bimObjectType
   *         description: |-
   *           Select the **relation to traverse**, not a different node type:
   *
   *           - `bimobject`: regular room equipment (default).
   *           - `referenceRoom`: room reference objects.
   *           - `referenceFloor`: floor reference objects.
   *
   *           Ignored when the supplied parent is a `BIMObjectGroup`.
   *         schema:
   *           type: string
   *           enum: ['bimobject', 'referenceRoom', 'referenceFloor']
   *           default: 'bimobject'
   *       - $ref: '#/components/parameters/queryFilter'
   *       - $ref: '#/components/parameters/queryOffset'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/INodeItemAttrMultiRes'
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   *       500:
   *         $ref: '#/components/responses/IErrorItemRes500'
   */
  app.get(
    '/api/v2/equipment',
    validate({
      query: z.strictObject({
        info: z.coerce.string().optional(),
        attributes: z.coerce.string().optional(),
        'add-attributes-modification-date': z.stringbool().optional(),
        'parent-dynamic-id': parentDynamicIdsQuerySchema.optional(),
        bimObjectType: z
          .enum(['bimobject', 'referenceRoom', 'referenceFloor'])
          .optional()
          .default('bimobject'),
        filter: z
          .union([z.record(z.string(), z.unknown()), z.string()])
          .optional(),
        offset: z.coerce.number().min(0).optional().default(0),
      }),
    }),
    async (req, res) => {
      try {
        const {
          attributes,
          'add-attributes-modification-date': addAttributesModificationDate,
        } = req.query;
        const parsedInfoQuery = parseInfoQuery(req.query.info);
        const parsedAttrQuery = parseAttributesQuery(attributes);
        const filters = parseFilterQuery(req.query);
        const { offset } = req.query;
        const { 'parent-dynamic-id': parentDynamicIds } = req.query;
        const profileId = getProfileId(req);
        const { geographicContext, building } = await getBuildingNode(
          spinalAPIMiddleware,
          profileId,
          false
        );
        const { bimObjectType } = req.query;
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
        return res
          .status(200)
          .json({
            data: equipmentData,
            offset,
            total: Array.isArray(foundNodes) ? foundNodes.length : undefined,
          });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
