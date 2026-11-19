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
import { addExtraInfoValidation } from '../requestParse/addExtraInfoValidation';
import {
  addExtraAttrValidation,
  addExtraCatAttrValidation,
} from '../requestParse/addExtraAttrValidation';
import { attributeValueSchema } from '../node/element/schema';

const infoFields = {
  name: z.string().min(1).max(200),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/)
    .optional(),
  icon: z.string().min(1).max(200).optional(),
};
const spatialCategory = addExtraAttrValidation(
  z.object({ area: attributeValueSchema.optional() })
).optional();
const spatialAttributes = addExtraCatAttrValidation(
  z.object({ Spatial: spatialCategory })
).optional();
const linkToGroups = z
  .array(
    z.strictObject({
      contextDynamicId: z.number().min(1),
      groupDynamicId: z.number().min(1),
    })
  )
  .optional();

export const createBuildingSchema = z.object({
  info: addExtraInfoValidation(z.object(infoFields), [
    'id',
    'staticId',
    'type',
    'dynamicId',
  ]),
  attributes: addExtraCatAttrValidation(
    z.object({
      'Spinal Building Information': addExtraAttrValidation(
        z.object({ Adresse: attributeValueSchema.optional() })
      ).optional(),
      Spatial: spatialCategory,
    })
  ).optional(),
});

export const createFloorSchema = z.object({
  info: addExtraInfoValidation(
    z.object({ ...infoFields, virtual: z.boolean().optional().default(false) }),
    ['id', 'staticId', 'type', 'dynamicId']
  ),
  linkToGroups,
  attributes: spatialAttributes,
});

export const createRoomSchema = z.object({
  dynamicFloorId: z.number().min(1),
  info: addExtraInfoValidation(
    z.object({ ...infoFields, virtual: z.boolean().optional().default(false) }),
    ['id', 'staticId', 'dynamicId', 'type']
  ),
  linkToGroups,
  attributes: spatialAttributes,
});

export const createEquipmentSchema = z.object({
  parentDynamicId: z.number().min(1),
  isRefObject: z.boolean().optional().default(false),
  info: addExtraInfoValidation(
    z.object({
      ...infoFields,
      virtual: z.boolean().optional(),
      dbid: z.coerce.number().optional(),
      externalId: z.string().min(1).max(200).optional(),
      bimFileId: z.string().min(1).max(200).optional(),
    }),
    ['id', 'staticId', 'dynamicId', 'type']
  ),
  linkToGroups,
  attributes: spatialAttributes,
});
