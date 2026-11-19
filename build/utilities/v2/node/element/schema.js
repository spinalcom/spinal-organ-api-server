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
exports.elementObject = exports.elementValue = exports.elementKey = exports.attributeValueSchema = exports.modelReferenceSchema = void 0;
const zod_1 = require("zod");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const resolveModelReference_1 = require("../resolveModelReference");
exports.modelReferenceSchema = zod_1.z.strictObject({
    $modelRef: zod_1.z.union([
        zod_1.z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
        zod_1.z.literal('self'),
    ]),
    path: zod_1.z.string().refine(resolveModelReference_1.isModelReferencePath, 'Invalid $modelRef path'),
});
exports.attributeValueSchema = zod_1.z.union([
    zod_1.z.string(),
    exports.modelReferenceSchema,
]);
exports.elementKey = zod_1.z
    .string()
    .refine((key) => !key.startsWith('_') &&
    key !== '$modelRef' &&
    key !== 'model_id' &&
    !(key in spinal_core_connectorjs_1.Model.prototype), 'Element keys must not shadow Model members or start with an underscore');
exports.elementValue = zod_1.z.lazy(() => zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number().finite(),
    zod_1.z.boolean(),
    zod_1.z.array(exports.elementValue),
    zod_1.z.preprocess(rejectPrototypeKey, zod_1.z.union([
        exports.modelReferenceSchema,
        exports.elementObject,
    ])),
]));
function rejectPrototypeKey(data, ctx) {
    // Zod records discard __proto__ before validating keys.
    if (data !== null &&
        typeof data === 'object' &&
        Object.hasOwn(data, '__proto__')) {
        ctx.addIssue({
            code: 'custom',
            message: 'Element keys must not shadow Model members or start with an underscore',
            path: ['__proto__'],
        });
        return zod_1.z.NEVER;
    }
    return data;
}
exports.elementObject = zod_1.z.preprocess(rejectPrototypeKey, zod_1.z.record(exports.elementKey, exports.elementValue));
//# sourceMappingURL=schema.js.map