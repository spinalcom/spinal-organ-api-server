import type { SpinalNode } from 'spinal-model-graph';
import { type IQueryFilterNode } from '../requestParse/parseFilterQuery';
/**
 * Tests a node against parsed filters, independently of response projections.
 * staticId maps to info.id; dynamicId and server_id map to _server_id.
 * Missing/undefined values match only exists=false, never ne.
 * Empty strings, false and 0 exist. Graph read errors propagate.
 */
export declare function matchesNodeFilter(node: SpinalNode, filters: readonly IQueryFilterNode[]): Promise<boolean>;
