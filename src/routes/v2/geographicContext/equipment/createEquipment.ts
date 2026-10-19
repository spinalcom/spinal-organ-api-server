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

import { prepareNodeCreation } from '../../../../utilities/v2/node/prepareNodeCreation';
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
import { createEquipmentSchema } from '../../../../utilities/v2/geographicContext/createSchemas';
import { linkNodeToGroups } from '../../../../utilities/v2/node/linkNodeToGroups';
import { loadAndValidateNode } from '../../../../utilities/loadAndValidateNode';
import {
  SpinalNode,
  SPINAL_RELATION_LST_PTR_TYPE,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-model-graph';
import { findBimEquipment } from '../../../../utilities/v2/geographicContext/findBimEquipment';
import {
  patchNode,
  patchNodeSchema,
} from '../../../../utilities/v2/node/patchNode';
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
   *     summary: Create equipment
   *     description: |-
   *       Create a BIMObject under a room, or a reference object under a room or floor.
   *
   *       ### Info, attributes and model references
   *
   *       See `POST /api/v2/node` for more about info, categorized attributes and `$modelRef` usage. Additional info and attribute values may reference Models. See **`INodeElementModelReference`** for full reference rules. This endpoint assigns the node type and uses `parentDynamicId` to select the parent; it does not accept `element` or `parents`.
   *
   *       ### Requirements
   *
   *       - A building must exist in the profile's spatial context.
   *       - Names must be unique among children of the selected equipment/reference relation.
   *       - Regular equipment requires a room parent.
   *       - With `isRefObject=true`, the parent may be a room or a floor.
   *       - New equipment/reference attachments use `PtrLst`. Existing `PtrLst` or `LstPtr` links to a reused BIM object are retained without migration or duplicate attachment.
   *
   *       ### Defaults
   *
   *       - `virtual`: `false`.
   *       - No default attributes are added.
   *
   *       ### BIM object reuse
   *
   *       When both `info.dbid` and `info.bimFileId` are supplied, reuse an existing equipment in that BIM file with the matching dbid. If none matches, create a new equipment. A missing BIM file returns HTTP 400.
   *
   *       ### Response
   *
   *       - Returns all info (including nested objects and arrays) and attributes.
   *       - Optional group linking happens after creation. Failures **do not roll back** the equipment.
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
   *                 description: Dynamic ID of a geographicRoom parent, or a geographicFloor parent when isRefObject=true.
   *                 minimum: 1
   *               isRefObject:
   *                 type: boolean
   *                 description: Use a room reference relation or floor reference relation instead of the regular equipment relation.
   *                 default: false
   *               info:
   *                 allOf:
   *                   - $ref: '#/components/schemas/ICreateNodeInfo'
   *                   - $ref: '#/components/schemas/INodeItemInfoPropVirtual'
   *                   - type: object
   *                     properties:
   *                       dbid:
   *                         type: number
   *                         description: Numeric dbid of the equipment for use in the APS Viewer.
   *                       externalId:
   *                         type: string
   *                         description: External ID of the equipment from Revit.
   *                       bimFileId:
   *                         type: string
   *                         description: Static ID of the BIM file to which the equipment belongs.
   *               attributes:
   *                 $ref: '#/components/schemas/ICreateNodeItemAttr'
   *               linkToGroups:
   *                 $ref: '#/components/schemas/ICreateNodeLinkToGroups'
   *             example:
   *               parentDynamicId: 123456789
   *               info:
   *                 name: "equipment Name"
   *                 color: "#FF0000"
   *                 icon: "room-icon"
   *                 dbid: 123
   *                 externalId: "external-id"
   *                 bimFileId: "123-abc-123-abc-456789"
   *     responses:
   *       201:
   *         $ref: '#/components/responses/INodeItemAttrRes'
   *       400:
   *         $ref: '#/components/responses/IErrorItemRes400'
   *       409:
   *         description: An equipment with the same name already exists for the selected parent and relation.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/IErrorItem'
   *       500:
   *         $ref: '#/components/responses/IErrorItemRes500'
   */
  app.post(
    '/api/v2/equipment',
    validate({
      body: createEquipmentSchema,
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
        const bim =
          info.bimFileId !== undefined && info.dbid !== undefined
            ? await findBimEquipment(
                spinalAPIMiddleware,
                profileId,
                info.bimFileId,
                info.dbid
              )
            : undefined;

        for (const oldEquip of oldEquipments) {
          if (
            oldEquip.info.name.get() === info.name &&
            oldEquip.getId().get() !== bim?.equipment?.getId().get()
          ) {
            throw createErrorMsgItem(
              EApiErrorType.CONFLICT,
              'An equipment with the same name already exists'
            );
          }
        }

        const existingRelations = [
          SPINAL_RELATION_PTR_LST_TYPE,
          SPINAL_RELATION_LST_PTR_TYPE,
        ].flatMap((type) => {
          const relation = parentNode.children
            .getElement(type)
            ?.getElement(relationParentToChild);
          return relation &&
            bim?.equipment &&
            relation.getChildrenIds().includes(bim.equipment.getId().get())
            ? [relation]
            : [];
        });
        const alreadyAttached = existingRelations.length > 0;
        if (
          alreadyAttached &&
          !isRefObject &&
          !(
            existingRelations.some((relation) =>
              relation.belongsToContext(geographicContext)
            ) && bim!.equipment!.belongsToContext(geographicContext)
          )
        )
          throw createErrorMsgItem(
            EApiErrorType.INVALID_REQUEST,
            'Equipment is already attached but not in the geographic context'
          );
        let newEquipment: SpinalNode;
        if (bim?.equipment) {
          newEquipment = bim.equipment;
          await patchNode(
            newEquipment,
            patchNodeSchema.parse({
              info: { set: info },
              ...(attributes ? { attributes: { set: attributes } } : {}),
            }),
            spinalAPIMiddleware,
            profileId
          );
        } else {
          newEquipment = await prepareNodeCreation(
            info.name,
            EQUIPMENT_TYPE,
            { ...info, virtual: info.virtual ?? false },
            undefined,
            attributes,
            undefined,
            spinalAPIMiddleware,
            profileId
          );
          if (bim) {
            let bimContextNode = bim.bimContext;
            if (!bimContextNode) {
              bimContextNode = new SpinalNode('BIMContext', 'SpinalNode');
              await bim.bimFile.addChild(
                bimContextNode,
                'hasBimContext',
                SPINAL_RELATION_PTR_LST_TYPE
              );
            }
            await bimContextNode.addChild(
              newEquipment,
              EQUIPMENT_RELATION,
              SPINAL_RELATION_PTR_LST_TYPE
            );
          }
        }
        if (!alreadyAttached && isRefObject) {
          await parentNode.addChild(
            newEquipment,
            relationParentToChild,
            SPINAL_RELATION_PTR_LST_TYPE
          );
        } else if (!alreadyAttached) {
          await parentNode.addChildInContext(
            newEquipment,
            relationParentToChild,
            SPINAL_RELATION_PTR_LST_TYPE,
            geographicContext
          );
        }

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
