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
import { getProfileId } from '../../../utilities/requestUtilities';
import {
  addFloor,
  FLOOR_RELATION,
} from 'spinal-env-viewer-context-geographic-service';
import { getNodeData } from '../models/getNodeData';
import { getBuildingNode } from '../../../utilities/geographicContext_v2/getBuilding';
import { addExtraInfoValidation } from '../../../utilities/geographicContext_v2/addExtraInfoValidation';
import {
  addExtraAttrValidation,
  addExtraCatAttrValidation,
} from '../../../utilities/geographicContext_v2/addExtraAttrValidation';
import { linkNodeToGroups } from '../../../utilities/geographicContext_v2/linkNodeToGroups';
import { handleSetAttribute } from '../../../utilities/geographicContext_v2/handleSetAttribute';
import { handleSetInfo } from '../../../utilities/geographicContext_v2/handleSetInfo';

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/floor:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: create a floor
   *     description: Create a floor.
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
   *                 description: Information about the floor, including its name, color, and icon. The following fields are forbidden 'id', 'staticId', 'type', 'dynamicId'
   *                 properties:
   *                   name:
   *                     type: string
   *                     description: name of the floor
   *                     maxLength: 200
   *                     minLength: 1
   *                   color:
   *                     type: string
   *                     description:  Hexadecimal color code for the floor (e.g., #RRGGBB)
   *                     pattern: "^#([A-Fa-f0-9]{6})$"
   *                   icon:
   *                     type: string
   *                     description: icon of the floor
   *                   virtual:
   *                     type: boolean
   *                     description: status of the floor (virtual or not)
   *                     default: false
   *                   additionalProperties:
   *                     oneOf:
   *                       - type: string
   *                       - type: number
   *                       - type: boolean
   *                 required:
   *                   - name
   *               attributes:
   *                 type: object
   *                 description: add attributes to floor
   *                 properties:
   *                   Spatial:
   *                     type: object
   *                     description: Spatial attributes category of the floor
   *                     properties:
   *                       area:
   *                         type: string
   *                         description: Area of the floor
   *                     additionalProperties:
   *                       type: string
   *                 additionalProperties:
   *                   type: object
   *                   additionalProperties:
   *                     type: string
   *               linkToGroups:
   *                 type: array
   *                 description: link the floor to groups
   *                 items:
   *                   type: object
   *                   properties:
   *                     contextDynamicId:
   *                       type: number
   *                       minimum: 1
   *                     groupDynamicId:
   *                       type: number
   *                       minimum: 1
   *             required:
   *               - info
   *             example:
   *               info:
   *                 name: "Floor Name"
   *                 color: "#FF0000"
   *                 icon: "floor-icon"
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
   *                 error:
   *                   type: object
   *       400:
   *         description: Bad request - Invalid input or parameters
   *       500:
   *         description: Internal server error
   */
  app.post(
    '/api/v2/floor',
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
            virtual: z.boolean().optional().default(false),
          }),
          ['id', 'staticId', 'type', 'dynamicId']
        ),
        linkToGroups: z
          .array(
            z.strictObject({
              contextDynamicId: z.number().min(1),
              groupDynamicId: z.number().min(1),
            })
          )
          .optional(),
        attributes: addExtraCatAttrValidation(
          z.object({
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
        const { geographicContext, building } = await getBuildingNode(
          spinalAPIMiddleware,
          profileId,
          false
        );
        if (!building) return res.status(404).send('Building not found');
        const { info, attributes, linkToGroups } = req.body;

        const oldFloors = await building.getChildrenInContext(
          geographicContext,
          FLOOR_RELATION
        );

        for (const oldFloor of oldFloors) {
          if (oldFloor.info.name.get() === info.name) {
            return res
              .status(400)
              .send('A floor with the same name already exists');
          }
        }

        const newFloor = await addFloor(geographicContext, building, info.name);
        await handleSetAttribute(newFloor, attributes, {
          Spatial: {
            category: 'Revit Level',
            area: '0',
          },
        });
        handleSetInfo(newFloor, info);

        const resObj = await getNodeData(newFloor, true, true);

        if (Array.isArray(linkToGroups) && linkToGroups.length > 0) {
          const linkResult = await linkNodeToGroups(
            spinalAPIMiddleware,
            profileId,
            newFloor,
            linkToGroups
          );
          return res.status(201).json({
            data: resObj,
            error: linkResult.errors.length > 0 ? linkResult.errors : undefined,
          });
        }
        return res.status(201).json({ data: resObj });
      } catch (error: any) {
        if (error?.code && error?.message)
          return res.status(error.code).send(error.message);
        return res
          .status(500)
          .send('An unexpected error occurred while creating the floor');
      }
    }
  );
};
