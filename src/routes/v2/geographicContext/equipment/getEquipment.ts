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
import {
  ROOM_TYPE,
  FLOOR_TYPE,
  EQUIPMENT_TYPE,
  EQUIPMENT_RELATION,
  REFERENCE_ROOM_RELATION,
  REFERENCE_RELATION,
} from 'spinal-env-viewer-context-geographic-service';
import { getNodeChildrenFromParentDynId, type IParentChildRelation } from '../../../../utilities/v2/node/getNodeChildrenFromParentDynId';
import {
  parseFilterQuery,
} from '../../../../utilities/v2/requestParse/parseFilterQuery';
import { filterNodes } from '../../../../utilities/v2/node/filterNodes';
import type { SpinalNode } from 'spinal-model-graph';
import { getBuildingNode } from '../../../../utilities/v2/geographicContext/getBuilding';
import { createErrorMsgItem } from '../../../../utilities/v2/errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../../../utilities/v2/errorHandler/EApiErrorType';
import { getEquipmentInContextIterable } from '../../../../utilities/v2/geographicContext/getEquipmentInContextIterable';

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
        'parent-dynamic-id': z.coerce.number().min(1).optional(),
        bimObjectType: z.enum(['bimobject', 'referenceRoom', 'referenceFloor']).optional().default('bimobject'),
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
        const { 'parent-dynamic-id': parentDynamicId } = req.query;
        const profileId = getProfileId(req);
        const { geographicContext, building } = await getBuildingNode(
          spinalAPIMiddleware,
          profileId,
          false
        );
        let foundNodes: Iterable<{ node: SpinalNode; parentId: number }> | AsyncIterable<{ node: SpinalNode; parentId: number }>;
        const { bimObjectType } = req.query;
        if (parentDynamicId) {
          let relationObj: IParentChildRelation | undefined;
          if (bimObjectType === 'bimobject') {
            relationObj = {
              relationName: EQUIPMENT_RELATION,
              parentType: ROOM_TYPE,
              context: geographicContext,
            };
          } else if (bimObjectType === 'referenceRoom') {
            relationObj = {
              relationName: REFERENCE_ROOM_RELATION,
              parentType: ROOM_TYPE,
            };
          } else if (bimObjectType === 'referenceFloor') {
            relationObj = {
              relationName: REFERENCE_RELATION,
              parentType: FLOOR_TYPE,
              context: geographicContext,
            };
          }
          if (!relationObj)
            throw createErrorMsgItem(
              EApiErrorType.ERROR_DATABASE,
              'No valid relation found for the given bimObjectType'
            );

          const nodes = await getNodeChildrenFromParentDynId(
            spinalAPIMiddleware,
            parentDynamicId,
            profileId,
            EQUIPMENT_TYPE,
            [
              relationObj, {
                relationName: `groupHas${EQUIPMENT_TYPE}`,
                parentType: `${EQUIPMENT_TYPE}Group`,
              }
            ]
          );
          foundNodes = nodes.map(node => ({ node, parentId: parentDynamicId }));
        } else {
          if (!building) {
            throw createErrorMsgItem(
              EApiErrorType.ERROR_DATABASE,
              'No building found in database'
            );
          }
          foundNodes = getEquipmentInContextIterable(geographicContext, building, bimObjectType);
        }

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
        return res.status(200).json({ data: equipmentData, offset, total: Array.isArray(foundNodes) ? foundNodes.length : undefined });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
