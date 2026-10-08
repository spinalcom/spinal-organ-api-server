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
  ROOM_RELATION,
  ROOM_TYPE,
  FLOOR_TYPE,
} from 'spinal-env-viewer-context-geographic-service';
import { getNodeChildrenFromParentDynId } from '../../../../utilities/v2/node/getNodeChildrenFromParentDynId';
import { getSpatialContext } from '../../../../utilities/getSpatialContext';
import type { INodeItem } from '../../openApiCompo/schemas/INodeItem';

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
   *     summary: Retrieve room by it's dynamic ID
   *     description: Retrieve room by its dynamic ID.
   *     tags:
   *       - geographicContext
   *     parameters:
   *       - $ref: '#/components/parameters/queryInfo'
   *       - $ref: '#/components/parameters/queryAttributes'
   *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
   *       - $ref: '#/components/parameters/paramParentDynId'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/INodeItemAttrMultiRes'
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   */
  app.get(
    '/api/v2/room',
    validate({
      query: z.strictObject({
        info: z.coerce.string().optional().default('false'),
        attributes: z.coerce.string().optional(),
        'add-attributes-modification-date': z.stringbool().optional(),
        'parent-dynamic-id': z.coerce.number().min(1).optional(),
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
        const { 'parent-dynamic-id': parentDynamicId } = req.query;
        const profileId = getProfileId(req);
        if (parentDynamicId) {
          const geographicContext = await getSpatialContext(
            spinalAPIMiddleware,
            profileId
          );
          const children = await getNodeChildrenFromParentDynId(
            spinalAPIMiddleware,
            parentDynamicId,
            profileId,
            ROOM_TYPE,
            [
              {
                relationName: ROOM_RELATION,
                parentType: FLOOR_TYPE,
                context: geographicContext,
              },
              {
                relationName: `groupHas${ROOM_TYPE}`,
                parentType: `${ROOM_TYPE}Group`,
              },
            ]
          );

          // TO DO
          // filter query + pagination
          const roomData = await Promise.all(
            children.map((child) =>
              getNodeData(
                child,
                parsedInfoQuery,
                parsedAttrQuery,
                addAttributesModificationDate,
                parentDynamicId
              )
            )
          );

          return res.status(200).json({ data: roomData });
        }

        // If no parentDynamicId is provided, fetch all rooms within the geographic context

        const roomData: INodeItem[] = [];
        return res.status(200).json({ data: roomData });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
