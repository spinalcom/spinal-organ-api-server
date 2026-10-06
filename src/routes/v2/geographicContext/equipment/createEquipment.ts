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
import {
  EQUIPMENT_RELATION,
  EQUIPMENT_TYPE,
  FLOOR_TYPE,
  REFERENCE_RELATION,
  REFERENCE_ROOM_RELATION,
  ROOM_TYPE,
} from 'spinal-env-viewer-context-geographic-service';
import { getNodeData } from '../../../../utilities/v2/node/getNodeData';
import { getBuildingNode } from '../../../../utilities/v2/geographicContext/getBuilding';
import { addExtraInfoValidation } from '../../../../utilities/v2/requestParse/addExtraInfoValidation';
import {
  addExtraAttrValidation,
  addExtraCatAttrValidation,
} from '../../../../utilities/v2/requestParse/addExtraAttrValidation';
import { linkNodeToGroups } from '../../../../utilities/v2/node/linkNodeToGroups';
import { handleSetAttribute } from '../../../../utilities/v2/node/handleSetAttribute';
import { handleSetInfo } from '../../../../utilities/v2/node/handleSetInfo';
import { loadAndValidateNode } from '../../../../utilities/loadAndValidateNode';
import { SPINAL_RELATION_LST_PTR_TYPE, SpinalNode } from 'spinal-model-graph';
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
   * /api/v2/equipment:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: create an equipment
   *     description: Create an equipment, either as a regular equipment or as a reference object.
   *     tags:
   *       - geographicContext
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - parentDynamicId
   *               - info
   *             properties:
   *               parentDynamicId:
   *                 type: number
   *                 description: The dynamic ID of the room to which the equipment belongs, can be an floor if it's for adding a reference object.
   *                 minimum: 1
   *               isRefObject:
   *                 type: boolean
   *                 description: Indicates if the equipment is to be added as an reference object
   *                 default: false
   *               info:
   *                 type: object
   *                 description: Information about the equipment, including its name, color, and icon. The following fields are forbidden 'id', 'staticId', 'type', 'dynamicId'
   *                 properties:
   *                   name:
   *                     type: string
   *                     description: name of the equipment
   *                     maxLength: 200
   *                     minLength: 1
   *                   color:
   *                     type: string
   *                     description:  Hexadecimal color code for the equipment (e.g., #RRGGBB)
   *                     pattern: "^#([A-Fa-f0-9]{6})$"
   *                   icon:
   *                     type: string
   *                     description: icon of the equipment
   *                   virtual:
   *                     type: boolean
   *                     description: status of the equipment (virtual or not)
   *                     default: false
   *                   dbid:
   *                     type: number
   *                     description: dbid of the equipment, for use in the APS Viewer
   *                   externalId:
   *                     type: string
   *                     description: External ID of the equipment comming from Revit
   *                   bimFileId:
   *                     type: string
   *                     description: staticId of the BimFile which the equipment belongs to
   *                   additionalProperties:
   *                     oneOf:
   *                       - type: string
   *                       - type: number
   *                       - type: boolean
   *                 required:
   *                   - name
   *               attributes:
   *                 type: object
   *                 description: add attributes to equipment
   *                 properties:
   *                   Spatial:
   *                     type: object
   *                     description: Spatial attributes category of the equipment
   *                     properties:
   *                       area:
   *                         type: string
   *                         description: Area of the equipment
   *                     additionalProperties:
   *                       type: string
   *                 additionalProperties:
   *                   type: object
   *                   additionalProperties:
   *                     type: string
   *               linkToGroups:
   *                 type: array
   *                 description: link the equipment to groups
   *                 items:
   *                   type: object
   *                   properties:
   *                     contextDynamicId:
   *                       type: number
   *                       minimum: 1
   *                     groupDynamicId:
   *                       type: number
   *                       minimum: 1
   *             example:
   *               parentDynamicId: 123456789
   *               info:
   *                 name: "equipment Name"
   *                 color: "#FF0000"
   *                 icon: "room-icon"
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
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/IErrorItem'
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
    '/api/v2/equipment',
    validate({
      body: z.object({
        parentDynamicId: z.number().min(1),
        isRefObject: z.boolean().optional().default(false),
        info: addExtraInfoValidation(
          z.object({
            name: z.string().min(1).max(200),
            color: z
              .string()
              .regex(/^#([A-Fa-f0-9]{6})$/)
              .optional(),
            icon: z.string().min(1).max(200).optional(),
            virtual: z.boolean().optional().default(false),
            dbid: z.coerce.number().optional(),
            externalId: z.string().min(1).max(200).optional(),
            bimFileId: z.string().min(1).max(200).optional(),
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

        const { parentDynamicId, info, attributes, linkToGroups, isRefObject } =
          req.body;
        let relationParentToChild:
          | typeof EQUIPMENT_RELATION
          | typeof REFERENCE_RELATION
          | typeof REFERENCE_ROOM_RELATION = EQUIPMENT_RELATION;
        const parentNode = await loadAndValidateNode(
          spinalAPIMiddleware,
          parentDynamicId,
          profileId
        );
        const parentType = parentNode.info.type.get();
        if (isRefObject) {
          if (parentType === FLOOR_TYPE) {
            relationParentToChild = REFERENCE_RELATION;
          } else if (parentType === ROOM_TYPE) {
            relationParentToChild = REFERENCE_ROOM_RELATION;
          } else {
            throw createErrorMsgItem(
              EApiErrorType.INVALID_LOAD_NODE_TYPE,
              'Invalid parent type for a reference object'
            );
          }
        } else if (parentType !== ROOM_TYPE) {
          throw createErrorMsgItem(
            EApiErrorType.INVALID_LOAD_NODE_TYPE,
            'Invalid parent type for an equipment'
          );
        }
        const oldEquipments = await parentNode.getChildren(
          relationParentToChild
        );

        for (const oldEquip of oldEquipments) {
          if (oldEquip.info.name.get() === info.name) {
            throw createErrorMsgItem(
              EApiErrorType.ERROR_DATABASE,
              'An equipment with the same name already exists'
            );
          }
        }

        const newEquipment = new SpinalNode(
          info.name,
          EQUIPMENT_TYPE,
          undefined
        );
        if (isRefObject) {
          await parentNode.addChild(
            newEquipment,
            relationParentToChild,
            SPINAL_RELATION_LST_PTR_TYPE
          );
        } else {
          await parentNode.addChildInContext(
            newEquipment,
            relationParentToChild,
            SPINAL_RELATION_LST_PTR_TYPE,
            geographicContext
          );
        }
        await handleSetAttribute(newEquipment, attributes, undefined);
        handleSetInfo(newEquipment, info);

        const resObj = await getNodeData(newEquipment, true, true);

        if (Array.isArray(linkToGroups) && linkToGroups.length > 0) {
          const linkResult = await linkNodeToGroups(
            spinalAPIMiddleware,
            profileId,
            newEquipment,
            linkToGroups
          );
          return res
            .status(201)
            .json({ data: resObj, error: linkResult.errors });
        }
        return res.status(201).json({ data: resObj });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
