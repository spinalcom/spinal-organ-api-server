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
exports.moveNodeSchema = exports.childAttachmentSchema = void 0;
const zod_1 = require("zod");
const spinal_model_graph_1 = require("spinal-model-graph");
const dynamicId = zod_1.z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const relationType = zod_1.z.enum([
    spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE,
    spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE,
    spinal_model_graph_1.SPINAL_RELATION_TYPE,
]);
exports.childAttachmentSchema = zod_1.z.strictObject({
    childDynamicId: dynamicId,
    relationName: zod_1.z.string().trim().min(1),
    relationType: relationType.default(spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE),
    contextDynamicId: dynamicId.optional(),
});
const moveLinkFields = {
    parentDynamicId: dynamicId,
    relationName: zod_1.z.string().refine((name) => name.trim().length > 0, {
        message: "relationName must not be blank",
    }),
    relationType,
};
exports.moveNodeSchema = zod_1.z.strictObject({
    from: zod_1.z.strictObject(moveLinkFields),
    to: zod_1.z.strictObject({
        ...moveLinkFields,
        contextDynamicId: dynamicId.optional(),
    }),
});
//# sourceMappingURL=schemas.js.map