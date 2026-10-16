import { Lst, Model, Ptr } from 'spinal-core-connectorjs';
import { SpinalNode, SpinalNodePointer } from 'spinal-model-graph';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service';
import type { SpinalAttribute } from 'spinal-models-documentation';
import { createErrorMsgItem } from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';

export function isModelReferencePath(path: string): boolean {
  const parts = path.split('.');
  return parts.length <= 32 &&
    parts.every((part) => part.length > 0 && !part.startsWith('_') &&
      part !== 'constructor' && part !== 'prototype' && part !== 'model_id') &&
    (parts[0] === 'info' || parts[0] === 'element' ||
      (parts[0] === 'attr' && parts.length === 3));
}

export async function resolveModelReference(node: SpinalNode, path: string): Promise<Model> {
  const invalid = () => createErrorMsgItem(
    EApiErrorType.INVALID_REQUEST,
    `$modelRef path "${path}" does not resolve to a Model on node ${node._server_id}`
  );
  if (!isModelReferencePath(path)) throw invalid();
  const [root, ...parts] = path.split('.');
  if (root === 'attr') {
    const [categoryName, label] = parts;
    const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);
    const category = categories.find((item) => item.getName().get() === categoryName);
    if (!category) throw invalid();
    const attributes: Lst<SpinalAttribute> | undefined = await category.getElement(true);
    if (!(attributes instanceof Lst)) throw invalid();
    for (const attribute of attributes) {
      if (attribute.label.get() === label && attribute.value instanceof Model) {
        return attribute.value;
      }
    }
    throw invalid();
  }
  let current: Model | undefined = root === 'info' ? node.info : await node.getElement(true);
  if (root === 'info' && parts[0] === 'staticId') parts[0] = 'id';
  for (const key of parts) {
    if (!(current instanceof Model) || current instanceof Ptr || current instanceof SpinalNodePointer) {
      throw invalid();
    }
    if (current instanceof Lst) {
      if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= current.length) throw invalid();
    } else if (!current._attribute_names.includes(key)) {
      throw invalid();
    }
    const next: unknown = current[key];
    if (!(next instanceof Model)) throw invalid();
    current = next;
  }
  if (!(current instanceof Model)) throw invalid();
  return current;
}
