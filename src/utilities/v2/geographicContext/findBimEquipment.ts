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

import { SpinalNode } from 'spinal-model-graph';
import { EQUIPMENT_RELATION } from 'spinal-env-viewer-context-geographic-service';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { loadAndValidateNode } from '../../loadAndValidateNode';
import { createErrorMsgItem } from '../errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../errorHandler/EApiErrorType';

export async function findBimEquipment(
  middleware: ISpinalAPIMiddleware,
  profileId: string,
  bimFileId: string,
  dbid: number
): Promise<{
  bimFile: SpinalNode;
  bimContext: SpinalNode | undefined;
  equipment: SpinalNode | undefined;
}> {
  const graph = await middleware.getGraph();
  const contexts = await graph.getChildren();
  const fileContext = contexts.find(
    (context) => context.info.name.get() === 'BimFileContext'
  );
  const files = fileContext ? await fileContext.getChildren('hasBimFile') : [];
  const bimFile = files.find((file) => file.info.id.get() === bimFileId);
  if (!bimFile)
    throw createErrorMsgItem(
      EApiErrorType.INVALID_REQUEST,
      'bimFileId given but NotFound'
    );
  const bimContexts = await bimFile.getChildren('hasBimContext');
  for (const context of bimContexts) {
    const objects = await context.getChildren(EQUIPMENT_RELATION);
    for (const object of objects) {
      if (object.info.dbid?.get() !== dbid) continue;
      if (!object._server_id)
        throw createErrorMsgItem(
          EApiErrorType.INTERNAL_ERROR,
          'BIM object has no dynamic ID'
        );
      const equipment = await loadAndValidateNode(
        middleware,
        object._server_id,
        profileId
      );
      return { bimFile, bimContext: context, equipment };
    }
  }
  return { bimFile, bimContext: bimContexts[0], equipment: undefined };
}
