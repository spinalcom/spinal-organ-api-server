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

import { Model, Ptr, Lst, Str } from 'spinal-core-connectorjs';
import {
  SpinalNode,
  SpinalNodePointer,
  SPINAL_RELATION_PTR_LST_TYPE,
  SPINAL_RELATION_LST_PTR_TYPE,
  SPINAL_RELATION_TYPE,
} from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import {
  createElement,
  type AttributeValue,
  type ElementValue,
  type ModelReference,
} from './createElement';
import { handleSetAttribute } from './handleSetAttribute';
import { handleSetInfo } from './handleSetInfo';
import { resolveModelReference } from './resolveModelReference';
import { createErrorMsgItem } from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalAttribute } from 'spinal-models-documentation';

export async function prepareNodeCreation(
  name: string,
  type: string,
  info: Record<string, ElementValue | undefined>,
  element: Record<string, ElementValue> | undefined,
  attributes: Record<string, Record<string, AttributeValue>> | undefined,
  defaults: Record<string, Record<string, string>> | undefined,
  middleware: ISpinalAPIMiddleware,
  profileId: string
): Promise<SpinalNode> {
  const node = new SpinalNode(name, type);
  const attributeReferences = new Map<string, ModelReference>();
  const stringAttributes: Record<string, Record<string, string>> = {};
  for (const [category, values] of Object.entries(attributes ?? {})) {
    stringAttributes[category] = {};
    for (const [label, value] of Object.entries(values)) {
      if (typeof value === 'string') {
        stringAttributes[category][label] = value;
      } else {
        stringAttributes[category][label] = '';
        attributeReferences.set(JSON.stringify([category, label]), value);
      }
    }
  }
  await handleSetAttribute(node, stringAttributes, defaults);

  const resolvedReferences = new Map<string, Str>();
  const activeReferences = new Set<string>();
  async function resolveAttributeReference(
    category: string,
    label: string
  ): Promise<Str> {
    const key = JSON.stringify([category, label]);
    const resolved = resolvedReferences.get(key);
    if (resolved) return resolved;
    const reference = attributeReferences.get(key);
    if (!reference) {
      const target = await resolveModelReference(
        node,
        `attr.${category}.${label}`
      );
      if (!(target instanceof Str)) {
        throw createErrorMsgItem(
          EApiErrorType.INVALID_REQUEST,
          `Attribute ${category}.${label} must reference a string Model`
        );
      }
      return target;
    }
    if (activeReferences.has(key)) {
      throw createErrorMsgItem(
        EApiErrorType.INVALID_REQUEST,
        `Circular attribute reference at ${category}.${label}`
      );
    }
    activeReferences.add(key);
    try {
      let target: unknown;
      if (
        reference.$modelRef === 'self' &&
        reference.path.startsWith('attr.')
      ) {
        const [, targetCategory, targetLabel, targetProperty] =
          reference.path.split('.');
        if (
          attributeReferences.has(
            JSON.stringify([targetCategory, targetLabel])
          )
        ) {
          target = await resolveAttributeReference(targetCategory, targetLabel);
          if (targetProperty === 'lastModificationDate') {
            target = await resolveModelReference(node, reference.path);
          }
        } else {
          target = await resolveModelReference(node, reference.path);
        }
      } else if (reference.$modelRef === 'self') {
        target = await resolveModelReference(node, reference.path);
      } else {
        const resolvedNode = await createElement(
          { value: reference },
          middleware,
          profileId
        );
        target = resolvedNode.value;
      }
      if (!(target instanceof Str)) {
        throw createErrorMsgItem(
          EApiErrorType.INVALID_REQUEST,
          `$modelRef for attribute ${category}.${label} must target a Str`
        );
      }
      const attribute = await findAttribute(node, category, label);
      attribute.mod_attr('value', target);
      resolvedReferences.set(key, target);
      return target;
    } finally {
      activeReferences.delete(key);
    }
  }
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
      throw invalid(`Circular self reference at ${path.join('.')}`);
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
    if (path.startsWith('attr.')) {
      const [, category, label] = path.split('.');
      const key = JSON.stringify([category, label]);
      if (attributeReferences.has(key)) {
        await resolveAttributeReference(category, label);
      }
      return resolveModelReference(node, path);
    }
    const parts = path.split('.');
    let value: ElementValue = raw;
    let index = 0;
    for (; index < parts.length; index++) {
      if (
        typeof value !== 'object' ||
        value === null ||
        Object.hasOwn(value, '$modelRef')
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
  for (const key of attributeReferences.keys()) {
    const [category, label] = JSON.parse(key) as [string, string];
    await resolveAttributeReference(category, label);
  }
  if (element !== undefined) {
    // Use the constructor to preserve the normal element-pointer representation.
    const holder = new SpinalNode(name, type, result.element);
    node.add_attr('element', holder.element);
  }
  return node;
}

async function findAttribute(
  node: SpinalNode,
  categoryName: string,
  label: string
): Promise<SpinalAttribute> {
  const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);
  const category = categories.find(
    (item) => item.getName().get() === categoryName
  );
  const attributes = category ? await category.getElement(true) : undefined;
  if (attributes instanceof Lst) {
    for (const attribute of attributes) {
      if (
        attribute instanceof SpinalAttribute &&
        attribute.label.get() === label
      ) {
        return attribute;
      }
    }
  }
  throw createErrorMsgItem(
    EApiErrorType.INTERNAL_ERROR,
    `Created attribute ${categoryName}.${label} could not be found`
  );
}

export async function applyPreparedNode(
  target: SpinalNode,
  prepared: SpinalNode
): Promise<void> {
  const info = new Model();
  for (const key of prepared.info._attribute_names) {
    if (key !== 'id') info.add_attr(key, prepared.info[key]);
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
