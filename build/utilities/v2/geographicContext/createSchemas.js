"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEquipmentSchema = exports.createRoomSchema = exports.createFloorSchema = exports.createBuildingSchema = void 0;
const zod_1 = require("zod");
const addExtraInfoValidation_1 = require("../requestParse/addExtraInfoValidation");
const addExtraAttrValidation_1 = require("../requestParse/addExtraAttrValidation");
const infoFields = {
    name: zod_1.z.string().min(1).max(200),
    color: zod_1.z
        .string()
        .regex(/^#([A-Fa-f0-9]{6})$/)
        .optional(),
    icon: zod_1.z.string().min(1).max(200).optional(),
};
const spatialCategory = (0, addExtraAttrValidation_1.addExtraAttrValidation)(zod_1.z.object({ area: zod_1.z.string().optional() })).optional();
const spatialAttributes = (0, addExtraAttrValidation_1.addExtraCatAttrValidation)(zod_1.z.object({ Spatial: spatialCategory })).optional();
const linkToGroups = zod_1.z
    .array(zod_1.z.strictObject({
    contextDynamicId: zod_1.z.number().min(1),
    groupDynamicId: zod_1.z.number().min(1),
}))
    .optional();
exports.createBuildingSchema = zod_1.z.object({
    info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object(infoFields), [
        'id',
        'staticId',
        'type',
        'dynamicId',
    ]),
    attributes: (0, addExtraAttrValidation_1.addExtraCatAttrValidation)(zod_1.z.object({
        'Spinal Building Information': (0, addExtraAttrValidation_1.addExtraAttrValidation)(zod_1.z.object({ Adresse: zod_1.z.string().optional() })).optional(),
        Spatial: spatialCategory,
    })).optional(),
});
exports.createFloorSchema = zod_1.z.object({
    info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object({ ...infoFields, virtual: zod_1.z.boolean().optional().default(false) }), ['id', 'staticId', 'type', 'dynamicId']),
    linkToGroups,
    attributes: spatialAttributes,
});
exports.createRoomSchema = zod_1.z.object({
    dynamicFloorId: zod_1.z.number().min(1),
    info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object({ ...infoFields, virtual: zod_1.z.boolean().optional().default(false) }), ['id', 'staticId', 'dynamicId', 'type']),
    linkToGroups,
    attributes: spatialAttributes,
});
exports.createEquipmentSchema = zod_1.z.object({
    parentDynamicId: zod_1.z.number().min(1),
    isRefObject: zod_1.z.boolean().optional().default(false),
    info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object({
        ...infoFields,
        virtual: zod_1.z.boolean().optional().default(false),
        dbid: zod_1.z.coerce.number().optional(),
        externalId: zod_1.z.string().min(1).max(200).optional(),
        bimFileId: zod_1.z.string().min(1).max(200).optional(),
    }), ['id', 'staticId', 'dynamicId', 'type']),
    linkToGroups,
    attributes: spatialAttributes,
});
//# sourceMappingURL=createSchemas.js.map