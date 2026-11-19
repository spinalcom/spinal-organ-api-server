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
import { getBuildingNode } from '../../../../utilities/v2/geographicContext/getBuilding';
import { findRoomNodes } from '../../../../utilities/v2/geographicContext/findRoomNodes';
import { parseFilterQuery } from '../../../../utilities/v2/requestParse/parseFilterQuery';
import { filterNodes } from '../../../../utilities/v2/node/filterNodes';
import { parentDynamicIdsQuerySchema } from '../../../../utilities/v2/requestParse/parseParentDynIdList';
import { createErrorMsgItem } from '../../../../utilities/v2/errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../../../utilities/v2/errorHandler/EApiErrorType';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/room:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Retrieve rooms
   *     description: |-
   *       Retrieve rooms from the floors of the profile's building or from a supplied parent.
   *
   *       > **Performance recommendation:** provide `parent-dynamic-id`.
   *       > Running this endpoint without it is **not recommended**, especially for large buildings,
   *       > because it may traverse many floors and rooms. Filters and the 200-item page limit
   *       > do not guarantee a small traversal.
   *       >
   *       > `parent-dynamic-id` accepts a comma-separated list. For a JSON body, use `POST /api/v2/room/search`.
   *
   *       ### Scope
   *
   *       - Without `parent-dynamic-id`: traverse the building's floors.
   *       - With `parent-dynamic-id`: retrieve direct children of a `geographicFloor` or `geographicRoomGroup`.
   *       - `groupHasgeographicRoom` is a relation name, not a node type.
   *
   *       ### Filtering and pagination
   *
   *       - All filter conditions use **AND**.
   *       - Filtering runs **before** `offset` and output projection.
   *       - Returns at most **200 matching rooms**. Use `offset=200` for the second page.
   *
   *       ### Response
   *
   *       - Each item includes `parentDynamicId`, even without a parent parameter.
   *       - With a parent parameter, `total` counts eligible children **before filtering**.
   *       - `total` is omitted for building-wide traversal.
   *
   *       ### Example
   *
   *       ```http
   *       GET /api/v2/room?parent-dynamic-id=132456&filter[attributes.Spatial.area][exists]=true&offset=0
   *       ```
   *     tags:
   *       - geographicContext
   *     parameters:
   *       - $ref: '#/components/parameters/queryInfo'
   *       - $ref: '#/components/parameters/queryAttributes'
   *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
   *       - $ref: '#/components/parameters/paramParentDynId'
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
    '/api/v2/room',
    validate({
      query: z.strictObject({
        info: z.coerce.string().optional(),
        attributes: z.coerce.string().optional(),
        'add-attributes-modification-date': z.stringbool().optional(),
        'parent-dynamic-id': parentDynamicIdsQuerySchema.optional(),
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
        const roomFound = await findRoomNodes({
          spinalAPIMiddleware,
          profileId,
          geographicContext,
          building,
          parentDynamicIds,
        });

        const page = await filterNodes(roomFound, filters, offset);
        const roomData = await Promise.all(
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
        return res.status(200).json({
          data: roomData,
          offset,
          total: Array.isArray(roomFound) ? roomFound.length : undefined,
        });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
