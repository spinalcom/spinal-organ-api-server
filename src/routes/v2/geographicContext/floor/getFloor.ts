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
import { getBuildingNode } from '../../../../utilities/v2/geographicContext/getBuilding';
import { parseInfoQuery } from '../../../../utilities/v2/requestParse/parseInfoQuery';
import { createErrorMsgItem } from '../../../../utilities/v2/errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../../../utilities/v2/errorHandler/EApiErrorType';
import { sendResponseError } from '../../../../utilities/v2/errorHandler/sendResponseError';
import { FLOOR_RELATION } from 'spinal-env-viewer-context-geographic-service';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/floor:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Retrieve floors
   *     description: Retrieve floors.
   *     tags:
   *       - geographicContext
   *     parameters:
   *       - $ref: '#/components/parameters/queryInfo'
   *       - $ref: '#/components/parameters/queryAttributes'
   *       - $ref: '#/components/parameters/queryAddAttributesModificationDate'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/INodeItemAttrMultiRes'
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   */
  app.get(
    '/api/v2/floor',
    validate({
      query: z.strictObject({
        info: z.coerce.string().optional().default('false'),
        attributes: z.coerce.string().optional(),
        'add-attributes-modification-date': z.stringbool().optional(),
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
        const profileId = getProfileId(req);
        const { building, geographicContext } = await getBuildingNode(
          spinalAPIMiddleware,
          profileId,
          true
        );
        if (!building)
          throw createErrorMsgItem(
            EApiErrorType.ERROR_DATABASE,
            'No building found in database'
          );

        const floorNodes = await building.getChildrenInContext(
          geographicContext,
          FLOOR_RELATION
        );

        const floorData = await Promise.all(
          floorNodes.map((floorNode) =>
            getNodeData(
              floorNode,
              parsedInfoQuery,
              parsedAttrQuery,
              addAttributesModificationDate
            )
          )
        );

        return res.status(200).json({ data: floorData });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
