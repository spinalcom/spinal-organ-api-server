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
import { Model } from "spinal-core-connectorjs";
import { isModelReferencePath } from "../resolveModelReference";

export type ElementValue =
  | string
  | number
  | boolean
  | ElementValue[]
  | { [key: string]: ElementValue };

export const elementKey = z
  .string()
  .refine(
    (key) =>
      !key.startsWith("_") &&
      key !== "$modelRef" &&
      key !== "model_id" &&
      !(key in Model.prototype),
    "Element keys must not shadow Model members or start with an underscore"
  );
export const elementValue: z.ZodType<ElementValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.array(elementValue),
    z.preprocess(
      rejectPrototypeKey,
      z.union([
        z.strictObject({
          $modelRef: z.union([
            z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
            z.literal("self"),
          ]),
          path: z
            .string()
            .refine(isModelReferencePath, "Invalid $modelRef path"),
        }),
        elementObject,
      ])
    ),
  ])
);
function rejectPrototypeKey(data: unknown, ctx: z.RefinementCtx) {
  // Zod records discard __proto__ before validating keys.
  if (
    data !== null &&
    typeof data === "object" &&
    Object.hasOwn(data, "__proto__")
  ) {
    ctx.addIssue({
      code: "custom",
      message:
        "Element keys must not shadow Model members or start with an underscore",
      path: ["__proto__"],
    });
    return z.NEVER;
  }
  return data;
}
export const elementObject = z.preprocess(
  rejectPrototypeKey,
  z.record(elementKey, elementValue)
);
