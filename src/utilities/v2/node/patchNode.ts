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

import { Bool, Lst, Model, Ptr, Str, Val } from 'spinal-core-connectorjs';
import { SpinalNode, SpinalNodePointer } from 'spinal-model-graph';
import {
  attributeService,
  NODE_TO_CATEGORY_RELATION,
} from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalAttribute } from 'spinal-models-documentation';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { createElement, elementKey, type ElementValue } from './createElement';
import {
  createErrorMsgItem,
  isErrorItem,
} from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';
import { serializeModel } from './getNodeElement';
import type { Patch } from './patch/schema';
import { selectPatchBranches } from './patch/selectBranches';
import { createModelStaging } from './patch/modelStaging';

export { patchNodeSchema } from './patch/schema';
const invalid = (message: string) =>
  createErrorMsgItem(EApiErrorType.INVALID_REQUEST, message);

export async function patchNode(
  node: SpinalNode,
  patch: Patch,
  middleware: ISpinalAPIMiddleware,
  profileId: string
): Promise<void> {
  function normalizeSelfReferences(value: ElementValue): ElementValue {
    if (typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(normalizeSelfReferences);
    if (Object.hasOwn(value, '$modelRef')) {
      return value.$modelRef === node._server_id
        ? { ...value, $modelRef: 'self' }
        : value;
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        normalizeSelfReferences(child),
      ])
    );
  }
  patch = { ...patch };
  for (const root of ['info', 'element'] as const) {
    const operations = patch[root];
    if (operations?.set) {
      patch[root] = {
        ...operations,
        set: Object.fromEntries(
          Object.entries(operations.set).map(([path, value]) => [
            path,
            normalizeSelfReferences(value),
          ])
        ),
      };
    }
  }
  const { selected, fullElement, selectedAttrs } = selectPatchBranches(patch);

  const { clone, stageRoot, populateRoots, commit } = createModelStaging();
  const info = stageRoot(node.info, selected.info);
  let element: Model | undefined;
  let existingElement: Model | undefined;
  if (patch.element || selected.element.size || fullElement) {
    const existing: Model | undefined = await node.getElement(true);
    existingElement = existing;
    if (existing) {
      if (fullElement)
        for (const key of existing._attribute_names) selected.element.add(key);
      if (existing === node.info) {
        for (const key of selected.element) selected.info.add(key);
        element = info;
      } else element = stageRoot(existing, selected.element);
    }
  }
  populateRoots();
  const hadElement = existingElement !== undefined;
  interface Attr {
    category: string;
    label: string;
    value: Model;
    original?: SpinalAttribute;
    list?: Lst<SpinalAttribute>;
  }
  const attrs: Attr[] = [];
  const categories = selectedAttrs.size
    ? await node.getChildren(NODE_TO_CATEGORY_RELATION)
    : [];
  for (const category of categories) {
    const categoryName = category.getName().get();
    const labels = selectedAttrs.get(categoryName);
    if (!labels) continue;
    const list: Lst<SpinalAttribute> | undefined = await category.getElement(
      true
    );
    if (!(list instanceof Lst)) throw invalid('Invalid attribute category');
    for (const attr of list) {
      if (!labels.has(attr.label.get())) continue;
      attrs.push({
        category: categoryName,
        label: attr.label.get(),
        value: clone(attr.value),
        original: attr,
        list,
      });
    }
  }
  const originalAttrs = [...attrs];
  const touched: string[][] = [];
  function claim(path: string[]) {
    if (
      touched.some((other) => {
        const length = Math.min(other.length, path.length);
        return other.slice(0, length).every((key, i) => key === path[i]);
      })
    )
      throw invalid(`Conflicting patch operations at ${path.join('.')}`);
    touched.push(path);
  }
  let count = 0;
  for (const item of patch.attributes?.rename ?? []) {
    count++;
    claim(['attr', item.category, item.from]);
    if (item.from !== item.to) claim(['attr', item.category, item.to]);
    const attr = attrs.find(
      (a) => a.category === item.category && a.label === item.from
    );
    if (!attr) throw invalid('Attribute to rename does not exist');
    if (
      item.from !== item.to &&
      attrs.some((a) => a.category === item.category && a.label === item.to)
    ) {
      throw invalid('Destination attribute label already exists');
    }
    attr.label = item.to;
  }
  for (const item of patch.attributes?.remove ?? []) {
    count++;
    claim(['attr', item.category, item.label]);
    const index = attrs.findIndex(
      (a) => a.category === item.category && a.label === item.label
    );
    if (index !== -1) attrs.splice(index, 1);
  }
  for (const [category, values] of Object.entries(
    patch.attributes?.set ?? {}
  )) {
    for (const [label, value] of Object.entries(values)) {
      count++;
      claim(['attr', category, label]);
      const attr = attrs.find(
        (a) => a.category === category && a.label === label
      );
      if (attr) attr.value.set(value);
      else attrs.push({ category, label, value: new Str(value) });
    }
  }
  function pathKeys(root: string, path: string, action: string): string[] {
    const keys = path.split('.');
    if (
      keys.length > 32 ||
      keys.some(
        (key) =>
          !elementKey.safeParse(key).success || key === 'prototype' || !key
      )
    )
      throw invalid(`Invalid patch path: ${path}`);
    if (root === 'info') {
      if (['id', 'staticId', 'dynamicId'].includes(keys[0]))
        throw invalid('Node IDs cannot be patched');
      if (keys[0] === 'type' && (action !== 'set' || keys.length !== 1)) {
        throw invalid('info.type can only be set');
      }
      if (keys[0] === 'name' && (action !== 'set' || keys.length !== 1)) {
        throw invalid('info.name can only be set');
      }
    }
    return keys;
  }
  function child(model: Model, key: string): Model | undefined {
    if (
      model instanceof Ptr ||
      model instanceof SpinalNodePointer ||
      model instanceof Str ||
      model instanceof Bool ||
      model instanceof Val
    )
      throw invalid('Cannot traverse a scalar or pointer');
    if (model instanceof Lst) {
      if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= model.length)
        throw invalid('Array index must already exist');
    } else if (!model._attribute_names.includes(key)) return undefined;
    return model[key];
  }
  function parent(
    root: Model,
    keys: string[],
    create: boolean
  ): Model | undefined {
    let current = root;
    for (const key of keys.slice(0, -1)) {
      let next = child(current, key);
      if (!next) {
        if (!create) return undefined;
        next = new Model();
        current.add_attr(key, next);
      }
      current = next;
    }
    return current;
  }
  function assign(target: Model, key: string, value: Model) {
    child(target, key);
    if (target instanceof Lst) target.set_or_push(Number(key), value);
    else target.mod_attr(key, value);
  }
  const pending = new Map<
    string,
    { root: 'info' | 'element'; keys: string[]; value: ElementValue }
  >();
  for (const root of ['info', 'element'] as const) {
    const ops = patch[root];
    if (!ops) continue;
    if (root === 'element' && !element) element = new Model();
    const model = root === 'info' ? info : element!;
    for (const path of ops.remove ?? []) {
      count++;
      const keys = pathKeys(root, path, 'remove');
      claim([root, ...keys]);
      const target = parent(model, keys, false);
      if (target instanceof Lst)
        throw invalid('Array entries cannot be removed');
      if (target && child(target, keys.at(-1)!)) target.rem_attr(keys.at(-1)!);
    }
    for (const rename of ops.rename ?? []) {
      count++;
      const from = pathKeys(root, rename.from, 'rename');
      const to = pathKeys(root, rename.to, 'rename');
      if (from.slice(0, -1).join('.') !== to.slice(0, -1).join('.'))
        throw invalid('Rename must stay in the same parent object');
      claim([root, ...from]);
      if (rename.from !== rename.to) claim([root, ...to]);
      const target = parent(model, from, false);
      if (!target || target instanceof Lst)
        throw invalid('Rename requires an existing object field');
      const source = child(target, from.at(-1)!);
      if (!source) throw invalid('Rename source does not exist');
      if (rename.from !== rename.to) {
        if (child(target, to.at(-1)!))
          throw invalid('Rename destination already exists');
        target.add_attr(to.at(-1)!, source);
        target.rem_attr(from.at(-1)!);
      }
    }
    for (const [path, value] of Object.entries(ops.set ?? {})) {
      count++;
      const keys = pathKeys(root, path, 'set');
      if (
        root === 'info' &&
        ['name', 'type'].includes(path) &&
        (typeof value !== 'string' || !value.length || value.length > 200)
      )
        throw invalid(
          `info.${path} must be a nonempty string of at most 200 characters`
        );
      claim([root, ...keys]);
      parent(model, keys, true);
      pending.set([root, ...keys].join('.'), { root, keys, value });
    }
  }
  if (!count) throw invalid('Patch must contain at least one operation');
  const active = new Set<string>();
  const resolved = new Set<string>();
  const builtValues = new Map<string, Model>();
  const building = new Set<string>();
  async function buildValue(
    value: ElementValue,
    base: string[]
  ): Promise<Model> {
    const wrapper = await createElement(
      { value },
      middleware,
      profileId,
      self,
      async (_value, local, build) => {
        const key = JSON.stringify([...base, ...local.slice(1)]);
        const cached = builtValues.get(key);
        if (cached) return cached;
        if (building.has(key))
          throw invalid(`Circular self reference at ${base.join('.')}`);
        building.add(key);
        try {
          let result = await build();
          const operation =
            local.length === 1 ? pending.get(base.join('.')) : undefined;
          if (operation) {
            const target = parent(
              operation.root === 'info' ? info : element!,
              operation.keys,
              true
            )!;
            const old = child(target, operation.keys.at(-1)!);
            if (
              (typeof operation.value === 'string' && old instanceof Str) ||
              (typeof operation.value === 'number' && old instanceof Val) ||
              (typeof operation.value === 'boolean' && old instanceof Bool)
            ) {
              old.set(operation.value);
              result = old;
            }
          }
          builtValues.set(key, result);
          return result;
        } finally {
          building.delete(key);
        }
      }
    );
    return wrapper.value;
  }
  async function self(path: string): Promise<Model> {
    if (path.startsWith('attr.')) {
      const [, category, label] = path.split('.');
      const attr = attrs.find(
        (a) => a.category === category && a.label === label
      );
      if (!attr) throw invalid(`Missing self path: ${path}`);
      return attr.value;
    }
    for (const [key, operation] of pending) {
      if (key === path || path.startsWith(key + '.')) {
        const suffix =
          path === key ? [] : path.slice(key.length + 1).split('.');
        let raw = operation.value;
        let index = 0;
        for (; index < suffix.length; index++) {
          if (typeof raw !== 'object' || Object.hasOwn(raw, '$modelRef')) break;
          const part = suffix[index];
          if (Array.isArray(raw)) {
            if (!/^(0|[1-9]\d*)$/.test(part) || Number(part) >= raw.length)
              throw invalid(`Missing self path: ${path}`);
            raw = raw[Number(part)];
          } else {
            if (!Object.hasOwn(raw, part))
              throw invalid(`Missing self path: ${path}`);
            raw = raw[part];
          }
        }
        const base = [
          operation.root,
          ...operation.keys,
          ...suffix.slice(0, index),
        ];
        let model = await buildValue(raw, base);
        for (const part of suffix.slice(index)) {
          const next = child(model, part);
          if (!next) throw invalid(`Missing self path: ${path}`);
          model = next;
        }
        return model;
      }
      if (key.startsWith(path + '.')) await resolve(key);
    }
    const [root, ...keys] = path.split('.');
    let model: Model | undefined = root === 'info' ? info : element;
    for (const key of keys) model = model ? child(model, key) : undefined;
    if (!model) throw invalid(`Missing self path: ${path}`);
    return model;
  }
  async function resolve(key: string): Promise<void> {
    if (resolved.has(key)) return;
    if (active.has(key)) throw invalid(`Circular self reference at ${key}`);
    active.add(key);
    const operation = pending.get(key)!;
    const built = await buildValue(operation.value, [
      operation.root,
      ...operation.keys,
    ]);
    const target = parent(
      operation.root === 'info' ? info : element!,
      operation.keys,
      true
    )!;
    const field = operation.keys.at(-1)!;
    const old = child(target, field);
    const value = built;
    if (
      (typeof operation.value === 'string' && old instanceof Str) ||
      (typeof operation.value === 'number' && old instanceof Val) ||
      (typeof operation.value === 'boolean' && old instanceof Bool)
    )
      old.set(operation.value);
    else assign(target, field, value);
    active.delete(key);
    resolved.add(key);
  }
  for (const key of pending.keys()) await resolve(key);
  // Validate staged branches before mutating persisted Models.
  try {
    serializeModel(info, true);
    if (element) serializeModel(element, true);
  } catch (error) {
    if (!isErrorItem(error)) throw error;
    throw invalid(error.message);
  }
  const changedAttrs = new Set(
    attrs.filter(
      (attr) =>
        attr.original &&
        (attr.original.label.get() !== attr.label ||
          attr.original.value.get() !== attr.value.get())
    )
  );
  commit(info);
  if (
    element &&
    (hadElement || Object.keys(patch.element?.set ?? {}).length > 0)
  ) {
    const result = commit(element);
    if (!node.element) node.add_attr('element', new SpinalNodePointer(result));
  }
  for (const attr of originalAttrs) {
    if (!attrs.includes(attr)) {
      const index = attr.list!.indexOf(attr.original!);
      if (index !== -1) attr.list!.splice(index, 1);
    }
  }
  for (const attr of attrs) {
    if (attr.original) {
      commit(attr.value);
      if (attr.original.label.get() !== attr.label)
        attr.original.label.set(attr.label);
      if (changedAttrs.has(attr))
        attr.original.lastModificationDate?.set(Date.now());
    } else {
      await attributeService.createOrUpdateAttrsAndCategories(
        node,
        attr.category,
        { [attr.label]: attr.value.get() }
      );
      const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);
      const category = categories.find(
        (item) => item.getName().get() === attr.category
      )!;
      const list: Lst<SpinalAttribute> = await category.getElement(true);
      for (const item of list)
        if (item.label.get() === attr.label)
          item.mod_attr('value', commit(attr.value));
    }
  }
  node.setDirectModificationDate();
}
