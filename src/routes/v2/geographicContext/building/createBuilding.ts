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
import { addBuilding } from 'spinal-env-viewer-context-geographic-service';
import { getNodeData } from '../../../../utilities/v2/node/getNodeData';
import { getBuildingNode } from '../../../../utilities/v2/geographicContext/getBuilding';
import { addExtraInfoValidation } from '../../../../utilities/v2/requestParse/addExtraInfoValidation';
import {
  addExtraAttrValidation,
  addExtraCatAttrValidation,
} from '../../../../utilities/v2/requestParse/addExtraAttrValidation';
import { handleSetAttribute } from '../../../../utilities/v2/node/handleSetAttribute';
import { handleSetInfo } from '../../../../utilities/v2/node/handleSetInfo';
import { EApiErrorType } from '../../../../utilities/v2/errorHandler/EApiErrorType';
import { createErrorMsgItem } from '../../../../utilities/v2/errorHandler/createErrorMsgItem';
import { sendResponseError } from '../../../../utilities/v2/errorHandler/sendResponseError';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**s
   * @swagger
   * /api/v2/building:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: create the building
   *     description: Create a building.
   *     tags:
   *       - geographicContext
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               info:
   *                 type: object
   *                 description: Information about the building, including its name, color, and icon. the following fields are forbidden 'id', 'staticId', 'type', 'dynamicId'
   *                 required:
   *                   - name
   *                 properties:
   *                   name:
   *                     type: string
   *                     description: name of the building
   *                     maxLength: 200
   *                     minLength: 1
   *                   color:
   *                     type: string
   *                     description:  Hexadecimal color code for the building (e.g., #RRGGBB)
   *                     pattern: "^#([A-Fa-f0-9]{6})$"
   *                   icon:
   *                     type: string
   *                     description: icon of the building
   *                   additionalProperties:
   *                     oneOf:
   *                       - type: string
   *                       - type: number
   *                       - type: boolean
   *               attributes:
   *                 type: object
   *                 description: add attributes to building
   *                 properties:
   *                   Spatial:
   *                     type: object
   *                     description: Spatial attributes category of the building
   *                     properties:
   *                       area:
   *                         type: string
   *                         description: Area of the building
   *                   Spinal Building Information:
   *                     type: object
   *                     description: Spinal Building Information attribute category of the building
   *                     properties:
   *                       area:
   *                         type: string
   *                         description: Area of the building
   *                     additionalProperties:
   *                       type: string
   *                 additionalProperties:
   *                   type: object
   *                   additionalProperties:
   *                     type: string
   *             required:
   *               - info
   *             example:
   *               info:
   *                 name: "Building Name"
   *                 color: "#FF0000"
   *                 icon: "building-icon"
   *               attributes:
   *                 Spatial:
   *                   area: "20"
   *     responses:
   *       201:
   *         description: Created Successfully
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
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   $ref: '#/components/schemas/IErrorItem'
   */
  app.post(
    '/api/v2/building',
    validate({
      body: z.object({
        info: addExtraInfoValidation(
          z.object({
            name: z.string().min(1).max(200),
            color: z
              .string()
              .regex(/^#([A-Fa-f0-9]{6})$/)
              .optional(),
            icon: z.string().min(1).max(200).optional(),
          }),
          ['id', 'staticId', 'type', 'dynamicId']
        ),
        attributes: addExtraCatAttrValidation(
          z.object({
            'Spinal Building Information': addExtraAttrValidation(
              z.object({
                Adresse: z.string().optional(),
              })
            ).optional(),
            Spatial: addExtraAttrValidation(
              z.object({
                area: z.string().optional(),
              })
            ).optional(),
          })
        ).optional(),
      }),
    }),
    async (req, res) => {
      try {
        const profileId = getProfileId(req);
        const { geographicContext, building: buildingOld } =
          await getBuildingNode(spinalAPIMiddleware, profileId, true);
        if (buildingOld)
          throw createErrorMsgItem(
            EApiErrorType.ERROR_DATABASE,
            'A building already exists'
          );
        const { info, attributes } = req.body;
        const newBuilding = await addBuilding(
          geographicContext,
          geographicContext,
          info.name
        );
        await handleSetAttribute(newBuilding, attributes, {
          'Spinal Building Information': {
            Adresse: 'To configure',
          },
          Spatial: {
            area: '0',
          },
        });
        handleSetInfo(newBuilding, info);
        const resObj = await getNodeData(newBuilding, true, true);
        return res.status(201).json({ data: resObj });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
