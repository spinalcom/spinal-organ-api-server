import type { SpinalNode } from 'spinal-model-graph';
import { type IQueryFilterNode } from '../requestParse/parseFilterQuery';
export declare const NODE_FILTER_PAGE_SIZE = 200;
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
export declare function filterNodes(nodes: Iterable<SpinalNode> | AsyncIterable<SpinalNode>, filters: readonly IQueryFilterNode[], offset?: number): Promise<SpinalNode[]>;
