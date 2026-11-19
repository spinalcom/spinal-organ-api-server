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

import type { ISpinalAPIMiddleware } from '../../../interfaces';
import {
  BUILDING_RELATION,
  BUILDING_TYPE,
  SITE_RELATION,
  createContext,
} from 'spinal-env-viewer-context-geographic-service';
import { getSpatialContext } from '../../getSpatialContext';
import type { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { createErrorMsgItem } from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';

export async function getBuildingNode(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  createContextIfNotFound: boolean = false
): Promise<{
  geographicContext: SpinalContext;
  building: SpinalNode | undefined;
}> {
  let geographicContext;
  try {
    geographicContext = await getSpatialContext(spinalAPIMiddleware, profileId);
  } catch (error) {}
  if (!geographicContext) {
    if (!createContextIfNotFound) {
      throw createErrorMsgItem(
        EApiErrorType.ERROR_DATABASE,
        'Geographic context not found'
      );
    }
    geographicContext = await createContext('spatial');
    const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
    const rootGraph = await spinalAPIMiddleware.getGraph();
    if (userGraph && userGraph !== rootGraph) {
      await userGraph.addContext(geographicContext);
    }
  }

  for await (const node of geographicContext.visitChildren([
    SITE_RELATION,
    BUILDING_RELATION,
  ])) {
    if (node.getType().get() === BUILDING_TYPE)
      return { geographicContext, building: node };
  }
  return { geographicContext, building: undefined };
}
