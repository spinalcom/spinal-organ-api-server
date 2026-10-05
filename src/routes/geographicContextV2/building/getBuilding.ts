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
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import type { Express } from 'express';
import { SpinalNode } from 'spinal-model-graph';
import { getProfileId } from '../../../utilities/requestUtilities';
import { parseAttributesQuery } from '../../../utilities/geographicContext_v2/parseAttributesQuery';
import { getNodeData } from '../models/getNodeData';
import { getBuildingNode } from '../../../utilities/geographicContext_v2/getBuilding';
import { parseInfoQuery } from '../../../utilities/geographicContext_v2/parseInfoQuery';

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
   *                 error:
   *                   type: object
   *       400:
   *         description: Bad request - Invalid input or parameters
   *       404:
   *         description: User not found
   */
  app.get(
    '/api/v2/building',
    validate({
      query: z.strictObject({
        info: z.coerce.string().optional().default('false'),
        attributes: z.coerce.string().optional(),
        'add-attributes-modification-date': z.stringbool().optional(),
        // .default(false),
      }),
    }),
    async (req, res) => {
      try {
        const {
          attributes,
          'add-attributes-modification-date': addAttributesModificationDate,
        } = req.query;
        const parsedInfoQuery = parseInfoQuery(req.query.info);
        console.log('parsedInfoQuery', parsedInfoQuery);
        const parsedAttrQuery = parseAttributesQuery(attributes);
        const profileId = getProfileId(req);
        const { building } = await getBuildingNode(
          spinalAPIMiddleware,
          profileId,
          true
        );
        if (!building) return res.status(404).send('Building not found');
        const data = await getNodeData(
          building,
          parsedInfoQuery,
          parsedAttrQuery,
          addAttributesModificationDate
        );

        return res.status(200).json({ data });
      } catch (error: any) {
        console.error('[getBuilding] error', error);
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send(
            'An unexpected error occurred while retrieving the building data'
          );
      }

      //     try {
      //       const profileId = getProfileId(req);
      //       const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
      //       if (!userGraph)
      //         throw { code: 401, message: `No graph found for ${profileId}` };
      //       const { attributes, groups, organizations } = req.query;
      //       try {
      //         const userNode = await spinalAPIMiddleware.load<SpinalNode>(
      //           userId,
      //           profileId
      //         );
      //         if (
      //           !userNode ||
      //           !(userNode instanceof SpinalNode) ||
      //           userNode.info.type.get() !== 'SpinalUser'
      //         ) {
      //           throw { code: 404, message: `User not found` };
      //         }
      //         const result = await getUserData(
      //           userNode,
      //           attributes,
      //           groups,
      //           organizations
      //         );
      //         res.status(200).json(result);
      //       } catch (error) {
      //         throw {
      //           code: 400,
      //           message:
      //             error instanceof Error
      //               ? error.message
      //               : 'Failed to retrieve user data',
      //         };
      //       }
      //     } catch (error: any) {
      //       if (error?.code && error?.message)
      //         return res.status(error.code).send(error.message);
      //       return res
      //         .status(500)
      //         .send('An unexpected error occurred while retrieving the user data');
      //     }
    }
  );
};
