import { ISpinalAPIMiddleware } from '../interfaces';
import { SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service';

export async function getNodePositionInContext(
    context,
    node
  ) {
    const contextStaticId = context.getId().get();
    return await buildPaths(node, contextStaticId);
  }
  
  async function buildPaths(node, contextStaticId) {
    const nodeName = node.getName().get();
    const nodeId = node._server_id;
  
    if (node.getId().get() === contextStaticId) {
      return { name: nodeName, dynamicId: nodeId, type: node.getType().get(), parentsInContext: [] };
    }
  
    const parents = await node.getParents();
    const parentsInContext = [];
  
    for (const parent of parents) {
      const contextIds = parent.getContextIds();
      if (contextIds.includes(contextStaticId) || parent.getId().get() === contextStaticId) {
        const parentPath = await buildPaths(parent, contextStaticId);
        parentsInContext.push(parentPath);
      }
    }
  
    return {
      name: nodeName,
      dynamicId: nodeId,
      type: node.getType().get(),
      parentsInContext,
    };
  }