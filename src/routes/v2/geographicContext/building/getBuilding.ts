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

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/building:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - read
   *     summary: Retrieve the building
   *     description: Retrieve a building.
   *     tags:
   *       - geographicContext
   *     parameters:
   *       - in: query
   *         name: info
   *         required: false
   *         description: Add fields information to the response. Can be "true" or a comma-separated list like "staticId,name". "true" will include all fields and in the latter case, "false" or omitting the parameter will include the default fields if present ('staticId','name', 'type', 'color', 'icon', 'virtual', 'bimFileId', 'dbid'),
   *         schema:
   *           type: string
   *         example: false
   *       - in: query
   *         name: attributes
   *         required: false
   *         description: Add attributes to the response. Can be "true" or a comma-separated list like "Spatial/area,Spatial/volume,OtherCategories". "true" will include all attributes from all categories and in the latter case, inputting only the category will include all the attributes within that category. "false" or omitting the parameter will include no attributes.
   *         schema:
   *           type: string
   *         example: true
   *       - in: query
   *         name: add-attributes-modification-date
   *         required: false
   *         description: add the modification date of the attributes
   *         example: ""
   *         schema:
   *           type: boolean
   *           default: false
   *     responses:
   *       200:
   *         description: Retrieve Successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   $ref: '#/components/schemas/INodeItem'
   *       400:
   *         description: Bad request - Invalid input or parameters
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   $ref: '#/components/schemas/IErrorItem'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   $ref: '#/components/schemas/IErrorItem'
   */
  app.get(
    '/api/v2/building',
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
        const { building } = await getBuildingNode(
          spinalAPIMiddleware,
          profileId,
          true
        );
        if (!building)
          throw createErrorMsgItem(
            EApiErrorType.ERROR_DATABASE,
            'No building found in database'
          );

        const data = await getNodeData(
          building,
          parsedInfoQuery,
          parsedAttrQuery,
          addAttributesModificationDate
        );

        return res.status(200).json({ data });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
