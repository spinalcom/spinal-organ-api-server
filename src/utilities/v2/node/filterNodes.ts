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

import type { SpinalNode } from 'spinal-model-graph';
import {
  type IQueryFilterNode,
  parseOffsetQuery,
} from '../requestParse/parseFilterQuery';
import { matchesNodeFilter } from './matchesNodeFilter';

export const NODE_FILTER_PAGE_SIZE = 200;
const NODE_FILTER_BATCH_SIZE = 20;

/**
 * Preserves input order, skips offset matching nodes and returns at most 200.
 * Only the returned nodes need conversion to INodeItem using getNodeData.
 * Checks up to 20 nodes concurrently, preserving their input order.
 * Stops reading after the batch that fills the page.
 *
 * @example
 * const filters = parseFilterQuery(req.query);
 * const offset = parseOffsetQuery(req.query);
 * const page = await filterNodes(nodes, filters, offset);
 * const data = await Promise.all(
 *   page.map((node) => getNodeData(node, infoQuery, attrQuery))
 * );
 * res.json({ data });
 */
export async function filterNodes(
  nodes: Iterable<{ node: SpinalNode; parentId: number }> | AsyncIterable<{ node: SpinalNode; parentId: number }>,
  filters: readonly IQueryFilterNode[],
  offset = 0
): Promise<{ node: SpinalNode; parentId: number }[]> {
  offset = parseOffsetQuery({ offset });
  const result: { node: SpinalNode; parentId: number }[] = [];
  let matched = 0;
  let batch: { node: SpinalNode; parentId: number }[] = [];
  async function processBatch(): Promise<void> {
    const matches = await Promise.all(
      batch.map(({ node }) => {
        return matchesNodeFilter(node, filters);
      })
    );
    for (let index = 0; index < batch.length; index++) {
      if (!matches[index]) continue;
      if (matched++ < offset) continue;
      result.push(batch[index]);
      if (result.length === NODE_FILTER_PAGE_SIZE) break;
    }
  }

  for await (const node of nodes) {
    batch.push(node);
    if (batch.length < NODE_FILTER_BATCH_SIZE) continue;
    await processBatch();
    if (result.length === NODE_FILTER_PAGE_SIZE) break;
    batch = [];
  }
  if (batch.length > 0 && result.length < NODE_FILTER_PAGE_SIZE) {
    await processBatch();
  }
  return result;
}
