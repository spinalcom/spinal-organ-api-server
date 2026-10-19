import type { SpinalNode } from 'spinal-model-graph';
/**
 * Handles setting attributes on a given SpinalNode based on the provided request and default categories.
 * @export
 * @param {SpinalNode} node
 * @param {(Record<string, Record<string, string>>)} requestCats The categories and attributes requested to be set on the node.
 * @param {(Record<string, Record<string, string>>)} defaultCats The default categories and attributes to fill.
 */
export declare function handleSetAttribute(node: SpinalNode, requestCats?: Record<string, Record<string, string>>, defaultCats?: Record<string, Record<string, string>>): Promise<void>;
