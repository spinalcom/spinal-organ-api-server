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
exports.addExtraInfoValidation = addExtraInfoValidation;
const zod_1 = require("zod");
const extraValueSchema = zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.boolean(),
    zod_1.z.number(),
    zod_1.z.undefined(),
]);
/**
 * Adds extra validation to a Zod object schema to catch all additional fields and forbid certain keys.
 * @param {z.ZodObject<T>} schema
 * @param {readonly string[]} forbiddenKeys - An array of keys that are not allowed in the object.
 */
function addExtraInfoValidation(schema, forbiddenKeys) {
    return schema.catchall(extraValueSchema).superRefine((obj, ctx) => {
        for (const key of forbiddenKeys) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                ctx.addIssue({
                    code: 'custom',
                    path: [key],
                    message: `Field "${key}" is not allowed`,
                });
            }
        }
    });
}
//# sourceMappingURL=addExtraInfoValidation.js.map