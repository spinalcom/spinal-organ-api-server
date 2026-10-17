import { Model, Ptr, Lst } from "spinal-core-connectorjs";
import {
  SpinalNode,
  SpinalNodePointer,
  SPINAL_RELATION_PTR_LST_TYPE,
  SPINAL_RELATION_LST_PTR_TYPE,
  SPINAL_RELATION_TYPE,
} from "spinal-model-graph";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { createElement, type ElementValue } from "./createElement";
import { handleSetAttribute } from "./handleSetAttribute";
import { handleSetInfo } from "./handleSetInfo";
import { resolveModelReference } from "./resolveModelReference";
import { createErrorMsgItem } from "../errorHandler/createErrorMsgItem";
import { EApiErrorType } from "../errorHandler/EApiErrorType";
import { NODE_TO_CATEGORY_RELATION } from "spinal-env-viewer-plugin-documentation-service";

export async function prepareNodeCreation(
  name: string,
  type: string,
  info: Record<string, ElementValue | undefined>,
  element: Record<string, ElementValue> | undefined,
  attributes: Record<string, Record<string, string>> | undefined,
  defaults: Record<string, Record<string, string>> | undefined,
  middleware: ISpinalAPIMiddleware,
  profileId: string
): Promise<SpinalNode> {
  const node = new SpinalNode(name, type);
  await handleSetAttribute(node, attributes, defaults);
  const rawInfo: Record<string, ElementValue> = { name, type };
  for (const [key, value] of Object.entries(info)) {
    if (value !== undefined) rawInfo[key] = value;
  }
  const raw: Record<string, ElementValue> = { info: rawInfo };
  if (element !== undefined) raw.element = element;
  const cache = new Map<string, Model>();
  const active = new Set<string>();
  const invalid = (message: string) =>
    createErrorMsgItem(EApiErrorType.INVALID_REQUEST, message);

  async function memo(
    path: string[],
    resolve: () => Promise<Model>
  ): Promise<Model> {
    const key = JSON.stringify(path);
    const cached = cache.get(key);
    if (cached) return cached;
    if (active.has(key))
      throw invalid(`Circular self reference at ${path.join(".")}`);
    active.add(key);
    try {
      const result = await resolve();
      cache.set(key, result);
      return result;
    } finally {
      active.delete(key);
    }
  }

  async function self(path: string): Promise<Model> {
    if (path.startsWith("attr.")) return resolveModelReference(node, path);
    const parts = path.split(".");
    let value: ElementValue = raw;
    let index = 0;
    for (; index < parts.length; index++) {
      if (
        typeof value !== "object" ||
        value === null ||
        Object.hasOwn(value, "$modelRef")
      )
        break;
      const key = parts[index];
      if (Array.isArray(value)) {
        if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)
          throw invalid(`Missing self path: ${path}`);
        value = value[Number(key)];
      } else {
        if (!Object.hasOwn(value, key))
          throw invalid(`Missing self path: ${path}`);
        value = value[key];
      }
    }
    const prefix = parts.slice(0, index);
    const resolved = await createElement(
      { value },
      middleware,
      profileId,
      self,
      (_value, local, resolve) => memo([...prefix, ...local.slice(1)], resolve)
    );
    let model: Model = resolved.value;
    for (const key of parts.slice(index)) {
      if (
        model instanceof Ptr ||
        model instanceof SpinalNodePointer ||
        (model instanceof Lst
          ? !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= model.length
          : !model._attribute_names.includes(key))
      )
        throw invalid(`Missing self path: ${path}`);
      const next: unknown = model[key];
      if (!(next instanceof Model)) throw invalid(`Missing self path: ${path}`);
      model = next;
    }
    return model;
  }

  const result = await createElement(
    raw,
    middleware,
    profileId,
    self,
    (_value, path, resolve) => memo(path, resolve)
  );
  await handleSetInfo(node, result.info);
  if (element !== undefined) {
    // Use the constructor to preserve the normal element-pointer representation.
    const holder = new SpinalNode(name, type, result.element);
    node.add_attr("element", holder.element);
  }
  return node;
}

export async function applyPreparedNode(
  target: SpinalNode,
  prepared: SpinalNode
): Promise<void> {
  const info = new Model();
  for (const key of prepared.info._attribute_names) {
    if (key !== "id") info.add_attr(key, prepared.info[key]);
  }
  await handleSetInfo(target, info);
  for (const category of await prepared.getChildren(
    NODE_TO_CATEGORY_RELATION
  )) {
    await target.addChild(
      category,
      NODE_TO_CATEGORY_RELATION,
      SPINAL_RELATION_PTR_LST_TYPE
    );
    for (const type of [
      SPINAL_RELATION_PTR_LST_TYPE,
      SPINAL_RELATION_LST_PTR_TYPE,
      SPINAL_RELATION_TYPE,
    ]) {
      if (prepared.hasRelation(NODE_TO_CATEGORY_RELATION, type)) {
        await prepared.removeChild(category, NODE_TO_CATEGORY_RELATION, type);
      }
    }
  }
}
