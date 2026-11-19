"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContextSchema = exports.createNodeSchema = void 0;
const zod_1 = require("zod");
const spinal_model_graph_1 = require("spinal-model-graph");
const addExtraInfoValidation_1 = require("../../requestParse/addExtraInfoValidation");
const schema_1 = require("../element/schema");
exports.createNodeSchema = zod_1.z.strictObject({
    info: (0, addExtraInfoValidation_1.addExtraInfoValidation)(zod_1.z.object({
        name: zod_1.z.string().min(1).max(200),
        type: zod_1.z.string().min(1).max(200),
    }), ['id', 'staticId', 'dynamicId']),
    attributes: zod_1.z
        .record(zod_1.z.string(), zod_1.z.record(zod_1.z.string(), schema_1.attributeValueSchema))
        .optional(),
    element: schema_1.elementObject.optional(),
    parents: zod_1.z
        .array(zod_1.z.strictObject({
        parentDynamicId: zod_1.z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
        relationName: zod_1.z.string().trim().min(1),
        relationType: zod_1.z
            .enum([
            spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE,
            spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE,
            spinal_model_graph_1.SPINAL_RELATION_TYPE,
        ])
            .optional()
            .default(spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE),
        contextDynamicId: zod_1.z
            .number()
            .int()
            .min(1)
            .max(Number.MAX_SAFE_INTEGER)
            .optional(),
    }))
        .min(1),
});
exports.createContextSchema = exports.createNodeSchema.omit({ parents: true });
//# sourceMappingURL=schema.js.map