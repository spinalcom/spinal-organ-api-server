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

import type { ElementValue } from '../createElement';
import type { Patch } from './schema';

export function selectPatchBranches(patch: Patch) {
  const selected = {
    info: new Set<string>(),
    element: new Set<string>(),
  };
  let fullElement = false;
  const selectedAttrs = new Map<string, Set<string>>();
  function selectAttr(category: string, label: string) {
    let labels = selectedAttrs.get(category);
    if (!labels) selectedAttrs.set(category, (labels = new Set()));
    labels.add(label);
  }
  function selectPath(root: 'info' | 'element', path: string) {
    selected[root].add(path.split('.')[0]);
  }
  function selectReferences(value: ElementValue): void {
    if (typeof value !== 'object') return;
    if (!Array.isArray(value) && '$modelRef' in value) {
      if (value.$modelRef === 'self' && typeof value.path === 'string') {
        const [root, key, label] = value.path.split('.');
        if (root === 'info') selected.info.add(key);
        else if (root === 'element') {
          if (key === undefined) fullElement = true;
          else selected.element.add(key);
        } else if (root === 'attr') selectAttr(key, label);
      }
      return;
    }
    for (const child of Object.values(value)) selectReferences(child);
  }
  for (const root of ['info', 'element'] as const) {
    const ops = patch[root];
    for (const path of ops?.remove ?? []) selectPath(root, path);
    for (const rename of ops?.rename ?? []) {
      selectPath(root, rename.from);
      selectPath(root, rename.to);
    }
    for (const [path, value] of Object.entries(ops?.set ?? {})) {
      selectPath(root, path);
      selectReferences(value);
    }
  }
  for (const item of patch.attributes?.rename ?? []) {
    selectAttr(item.category, item.from);
    selectAttr(item.category, item.to);
  }
  for (const item of patch.attributes?.remove ?? [])
    selectAttr(item.category, item.label);
  for (const [category, values] of Object.entries(patch.attributes?.set ?? {}))
    for (const label of Object.keys(values)) selectAttr(category, label);

  return { selected, fullElement, selectedAttrs };
}
