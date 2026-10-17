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
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { createErrorMsgItem } from "../errorHandler/createErrorMsgItem";
import { EApiErrorType } from "../errorHandler/EApiErrorType";
import { SpinalNode } from "spinal-model-graph";
import { isModelReferencePath, resolveModelReference } from "./resolveModelReference";

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
          $modelRef: z.union([z.number().int().min(1).max(Number.MAX_SAFE_INTEGER), z.literal("self")]),
          path: z.string().refine(isModelReferencePath, "Invalid $modelRef path"),
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

export async function createElement(
  data: Record<string, ElementValue>,
  middleware: ISpinalAPIMiddleware,
  profileId: string,
  self?: (path: string) => Promise<Model>,
  build?: (value: ElementValue, path: string[], resolve: () => Promise<Model>) => Promise<Model>
): Promise<Model> {
  const nodes = new Map<number, SpinalNode>();
  const references = new Map<string, Model>();
  type ResolvedValue = string | number | boolean | Model | ResolvedValue[];

  async function resolve(value: ElementValue, path: string[] = []): Promise<ResolvedValue> {
    if (build) {
      return build(value, path, async () => {
        const result = await resolveUncached(value, path);
        if (result instanceof Model) return result;
        const wrapper = new Model();
        wrapper.add_attr("value", result);
        return wrapper.value;
      });
    }
    return resolveUncached(value, path);
  }
  async function resolveUncached(value: ElementValue, path: string[]): Promise<ResolvedValue> {
    if (Array.isArray(value)) {
      const result: ResolvedValue[] = [];
      for (const [index, item] of value.entries()) result.push(await resolve(item, [...path, String(index)]));
      return result;
    }
    if (typeof value !== "object") return value;
    if (
      Object.hasOwn(value, "$modelRef") &&
      (typeof value.$modelRef === "number" || value.$modelRef === "self")
    ) {
      const id = value.$modelRef;
      if (typeof value.path !== "string" || !isModelReferencePath(value.path)) {
        throw createErrorMsgItem(EApiErrorType.INVALID_REQUEST, "Invalid $modelRef path");
      }
      if (id === "self") {
        if (!self) throw createErrorMsgItem(EApiErrorType.INVALID_REQUEST, "Self reference is unavailable in this creation context");
        return self(value.path);
      }
      const key = JSON.stringify([id, value.path]);
      const cached = references.get(key);
      if (cached) return cached;
      let node = nodes.get(id);
      if (!node) {
        let loaded: Model;
        try {
          loaded = await middleware.load<Model>(id, profileId);
        } catch (error) {
          console.error(error);
          throw createErrorMsgItem(
            EApiErrorType.INVALID_LOAD_NODE,
            `Error: Loading $modelRef node ${id} failed`
          );
        }
        if (!(loaded instanceof SpinalNode)) {
          throw createErrorMsgItem(
            EApiErrorType.INVALID_LOAD_NODE_TYPE,
            `$modelRef ${id} is not a SpinalNode`
          );
        }
        node = loaded;
        nodes.set(id, node);
      }
      const model = await resolveModelReference(node, value.path);
      references.set(key, model);
      return model;
    }
    return createObject(value, path);
  }

  async function createObject(
    value: Record<string, ElementValue>,
    path: string[] = []
  ): Promise<Model> {
    const model = new Model();
    for (const [key, item] of Object.entries(value)) {
      model.add_attr(key, await resolve(item, [...path, key]));
    }
    return model;
  }

  return createObject(data);
}
