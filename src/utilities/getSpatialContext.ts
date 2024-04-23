import { ISpinalAPIMiddleware } from '../interfaces';
import {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

export async function getSpatialContext(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string
): Promise<SpinalNode<any>> {
  const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
  const contexts = await userGraph.getChildren('hasContext');
  const spatialContext = contexts.find(
    (el) =>
      el.getName().get() === 'spatial' &&
      el.getType().get() === 'geographicContext'
  );
  if (!spatialContext) throw new Error('spatial context not found');
  return spatialContext;
}
