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

import { z } from "zod";
import {
  SPINAL_RELATION_PTR_LST_TYPE,
  SPINAL_RELATION_LST_PTR_TYPE,
  SPINAL_RELATION_TYPE,
} from "spinal-model-graph";
import { addExtraInfoValidation } from "../../requestParse/addExtraInfoValidation";
import { elementObject } from "../element/schema";

export const createNodeSchema = z.strictObject({
  info: addExtraInfoValidation(
    z.object({
      name: z.string().min(1).max(200),
      type: z.string().min(1).max(200),
    }),
    ["id", "staticId", "dynamicId"]
  ),
  attributes: z.record(z.string(), z.record(z.string(), z.string())).optional(),
  element: elementObject.optional(),
  parents: z
    .array(
      z.strictObject({
        parentDynamicId: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
        relationName: z.string().trim().min(1),
        relationType: z
          .enum([
            SPINAL_RELATION_PTR_LST_TYPE,
            SPINAL_RELATION_LST_PTR_TYPE,
            SPINAL_RELATION_TYPE,
          ])
          .optional()
          .default(SPINAL_RELATION_PTR_LST_TYPE),
        contextDynamicId: z
          .number()
          .int()
          .min(1)
          .max(Number.MAX_SAFE_INTEGER)
          .optional(),
      })
    )
    .min(1),
});
