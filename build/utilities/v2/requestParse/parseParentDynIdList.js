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
exports.parentDynamicIdsBodySchema = exports.parentDynamicIdsQuerySchema = exports.MAX_PARENT_DYNAMIC_IDS = void 0;
const zod_1 = require("zod");
exports.MAX_PARENT_DYNAMIC_IDS = 50;
const parentDynamicIdArraySchema = zod_1.z
    .array(zod_1.z.number().int().min(1))
    .min(1)
    .max(exports.MAX_PARENT_DYNAMIC_IDS)
    .transform((ids) => [...new Set(ids)]);
/**
 * Query form: `parent-dynamic-id=132456,132457`.
 * Duplicates are removed; empty or non-integer entries are rejected.
 */
exports.parentDynamicIdsQuerySchema = zod_1.z
    .string()
    .transform((value) => value.split(',').map((part) => Number(part.trim())))
    .pipe(parentDynamicIdArraySchema);
/**
 * JSON body form: `"parentDynamicIds": [132456, 132457]`.
 */
exports.parentDynamicIdsBodySchema = parentDynamicIdArraySchema;
//# sourceMappingURL=parseParentDynIdList.js.map