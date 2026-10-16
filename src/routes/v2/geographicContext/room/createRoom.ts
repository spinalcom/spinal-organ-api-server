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
import type { Express } from 'express';
import { getProfileId } from '../../../../utilities/requestUtilities';
import {
  addRoom,
  FLOOR_TYPE,
  ROOM_RELATION,
} from 'spinal-env-viewer-context-geographic-service';
import { loadAndValidateNode } from '../../../../utilities/loadAndValidateNode';
import type { ISpinalAPIMiddleware } from '../../../../interfaces';
import {
  addExtraAttrValidation,
  addExtraCatAttrValidation,
} from '../../../../utilities/v2/requestParse/addExtraAttrValidation';
import { linkNodeToGroups } from '../../../../utilities/v2/node/linkNodeToGroups';
import { handleSetAttribute } from '../../../../utilities/v2/node/handleSetAttribute';
import { handleSetInfo, resolveInfo } from '../../../../utilities/v2/node/handleSetInfo';
import { getNodeData } from '../../../../utilities/v2/node/getNodeData';
import { getBuildingNode } from '../../../../utilities/v2/geographicContext/getBuilding';
import { addExtraInfoValidation } from '../../../../utilities/v2/requestParse/addExtraInfoValidation';
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
   * /api/v2/room:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create a room
   *     description: |-
   *       Create a room under the floor identified by `dynamicFloorId`, using the profile's spatial context.
   *
   *       ### Requirements
   *       - A building must exist.
   *       - The room name must be unique within the floor.
   *
   *       ### Defaults
   *       - `virtual`: `false`.
   *       - `Spatial.area`: `"0"`.
   *       - `Spatial.category`: `"Revit Pièces"`.
   *       - Supplied values override these defaults.
   *
   *       ### Response
   *       - Returns all info (including nested objects and arrays) and attributes.
   *       - Optional group linking happens after creation. Failures **do not roll back** the room.
   *     tags:
   *       - geographicContext
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - dynamicFloorId
   *               - info
   *             properties:
   *               dynamicFloorId:
   *                 type: number
   *                 description: The dynamic ID of the floor to which the room belongs
   *                 minimum: 1
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
   *               dynamicFloorId: 123456789
   *               info:
   *                 name: "Room Name"
   *                 color: "#FF0000"
   *                 icon: "room-icon"
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
    '/api/v2/room',
    validate({
      body: z.object({
        dynamicFloorId: z.number().min(1),
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
          ['id', 'staticId', 'dynamicId', 'type']
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
        const { dynamicFloorId, info, attributes, linkToGroups } = req.body;
        const floorNode = await loadAndValidateNode(
          spinalAPIMiddleware,
          dynamicFloorId,
          profileId,
          FLOOR_TYPE
        );

        const oldRooms = await floorNode.getChildrenInContext(
          geographicContext,
          ROOM_RELATION
        );

        for (const oldRoom of oldRooms) {
          if (oldRoom.info.name.get() === info.name) {
            throw createErrorMsgItem(
              EApiErrorType.ERROR_DATABASE,
              'A room with the same name already exists'
            );
          }
        }

        const resolvedInfo = await resolveInfo(info, spinalAPIMiddleware, profileId);
        const newRoom = await addRoom(geographicContext, floorNode, info.name);
        await handleSetAttribute(newRoom, attributes, {
          Spatial: {
            area: '0',
            category: 'Revit Pièces',
          },
        });
        await handleSetInfo(newRoom, resolvedInfo);

        const resObj = await getNodeData(newRoom, true, true);

        if (Array.isArray(linkToGroups) && linkToGroups.length > 0) {
          const linkResult = await linkNodeToGroups(
            spinalAPIMiddleware,
            profileId,
            newRoom,
            linkToGroups
          );
          return res
            .status(201)
            .json({
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
