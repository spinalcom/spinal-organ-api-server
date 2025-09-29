/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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

import type { ISpinalAPIMiddleware } from '../../interfaces/ISpinalAPIMiddleware';
import { SpinalContext } from 'spinal-model-graph';
import { TICKET_CONTEXT_TYPE } from 'spinal-service-ticket';
import { loadAndValidateNode } from '../loadAndValidateNode';

export async function getWorkflowContextNode(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  workflowServerId: string
): Promise<SpinalContext> {
  const workflowContextNode: SpinalContext = await loadAndValidateNode(
    spinalAPIMiddleware,
    parseInt(workflowServerId, 10),
    profileId,
    TICKET_CONTEXT_TYPE
  );

  if (!(workflowContextNode instanceof SpinalContext))
    throw {
      code: 400,
      message: `this context is not a '${TICKET_CONTEXT_TYPE}'`,
    };
  return workflowContextNode;
}
