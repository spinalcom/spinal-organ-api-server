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
exports.patchNodeSchema = void 0;
const zod_1 = require("zod");
const createElement_1 = require("../createElement");
const operations = zod_1.z.strictObject({
    set: zod_1.z.record(zod_1.z.string(), createElement_1.elementValue).optional(),
    remove: zod_1.z.array(zod_1.z.string()).optional(),
    rename: zod_1.z
        .array(zod_1.z.strictObject({ from: zod_1.z.string(), to: zod_1.z.string() }))
        .optional(),
});
const attributeKey = zod_1.z.strictObject({
    category: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
});
exports.patchNodeSchema = zod_1.z.strictObject({
    info: operations.optional(),
    element: operations.optional(),
    attributes: zod_1.z
        .strictObject({
        set: zod_1.z
            .record(zod_1.z.string().min(1), zod_1.z.record(zod_1.z.string().min(1), zod_1.z.string()))
            .optional(),
        remove: zod_1.z.array(attributeKey).optional(),
        rename: zod_1.z
            .array(zod_1.z.strictObject({
            category: zod_1.z.string().min(1),
            from: zod_1.z.string().min(1),
            to: zod_1.z.string().min(1),
        }))
            .optional(),
    })
        .optional(),
});
//# sourceMappingURL=schema.js.map