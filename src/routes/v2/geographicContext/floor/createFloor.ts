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
import {
  addFloor,
  FLOOR_RELATION,
} from 'spinal-env-viewer-context-geographic-service';
import {
  addExtraAttrValidation,
  addExtraCatAttrValidation,
} from '../../../../utilities/v2/requestParse/addExtraAttrValidation';
import { linkNodeToGroups } from '../../../../utilities/v2/node/linkNodeToGroups';
import { handleSetAttribute } from '../../../../utilities/v2/node/handleSetAttribute';
import { handleSetInfo } from '../../../../utilities/v2/node/handleSetInfo';
import { getProfileId } from '../../../../utilities/requestUtilities';
import { getNodeData } from '../../../../utilities/v2/node/getNodeData';
import { getBuildingNode } from '../../../../utilities/v2/geographicContext/getBuilding';
import { addExtraInfoValidation } from '../../../../utilities/v2/requestParse/addExtraInfoValidation';
import { sendResponseError } from '../../../../utilities/v2/errorHandler/sendResponseError';
import { createErrorMsgItem } from '../../../../utilities/v2/errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../../../utilities/v2/errorHandler/EApiErrorType';

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
   *             required:
   *               - info
   *             properties:
   *               info:
   *                 allOf:
   *                   - $ref: '#/components/schemas/ICreateNodeInfo'
   *                   - $ref: '#/components/schemas/INodeItemInfoPropVirtual'
   *               attributes:
   *                 allOf:
   *                   - $ref: '#/components/schemas/ICreateNodeItemAttr'
   *                   - $ref: '#/components/schemas/ICreateNodeItemAttrSpatialCat'
   *               linkToGroups:
   *                 $ref: '#/components/schemas/ICreateNodeLinkToGroups'
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
   *         $ref: '#/components/responses/INodeItemAttrRes'
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   *       500:
   *         $ref: '#/components/responses/IErrorItemRes500'
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
        if (!building)
          throw createErrorMsgItem(
            EApiErrorType.ERROR_DATABASE,
            'No building found in database'
          );
        const { info, attributes, linkToGroups } = req.body;

        const oldFloors = await building.getChildrenInContext(
          geographicContext,
          FLOOR_RELATION
        );

        for (const oldFloor of oldFloors) {
          if (oldFloor.info.name.get() === info.name) {
            throw createErrorMsgItem(
              EApiErrorType.ERROR_DATABASE,
              'A floor with the same name already exists'
            );
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
        sendResponseError(res, error);
      }
    }
  );
};
