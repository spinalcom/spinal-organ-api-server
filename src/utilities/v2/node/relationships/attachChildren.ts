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

import type { z } from "zod";
import { SpinalContext } from "spinal-model-graph";
import type { ISpinalAPIMiddleware } from "../../../../interfaces";
import type { IErrorItem } from "../../../../routes/v2/openApiCompo/schemas/IErrorItem";
import { loadAndValidateNode } from "../../../loadAndValidateNode";
import {
  createErrorMsgItem,
  isErrorItem,
} from "../../errorHandler/createErrorMsgItem";
import { EApiErrorType } from "../../errorHandler/EApiErrorType";
import type { childAttachmentSchema } from "./schemas";

type ChildAttachment = z.infer<typeof childAttachmentSchema>;

export async function attachChildren(
  middleware: ISpinalAPIMiddleware,
  profileId: string,
  parentId: number,
  children: ChildAttachment[]
) {
  const parent = await loadAndValidateNode(middleware, parentId, profileId);
  const data: (ChildAttachment & {
    index: number;
    parentDynamicId: number;
    status: "attached" | "alreadyAttached";
  })[] = [];
  const errors: (IErrorItem & { index: number; child: ChildAttachment })[] = [];
  for (const [index, entry] of children.entries()) {
    try {
      const child = await loadAndValidateNode(
        middleware,
        entry.childDynamicId,
        profileId
      );
      let context: SpinalContext | undefined;
      if (entry.contextDynamicId !== undefined) {
        const loaded = await loadAndValidateNode(
          middleware,
          entry.contextDynamicId,
          profileId
        );
        if (!(loaded instanceof SpinalContext))
          throw createErrorMsgItem(
            EApiErrorType.INVALID_LOAD_NODE_TYPE,
            `Node ${entry.contextDynamicId} is not a SpinalContext`
          );
        context = loaded;
      }
      const relation = parent.children
        .getElement(entry.relationType)
        ?.getElement(entry.relationName);
      const exists =
        relation?.getChildrenIds().includes(child.getId().get()) ?? false;
      if (
        exists &&
        context &&
        !(
          relation!.belongsToContext(context) && child.belongsToContext(context)
        )
      )
        throw createErrorMsgItem(
          EApiErrorType.INVALID_REQUEST,
          "Child is already attached but not in the requested context"
        );
      if (!exists) {
        if (context)
          await parent.addChildInContext(
            child,
            entry.relationName,
            entry.relationType,
            context
          );
        else
          await parent.addChild(child, entry.relationName, entry.relationType);
      }
      data.push({
        ...entry,
        index,
        parentDynamicId: parentId,
        status: exists ? "alreadyAttached" : "attached",
      });
    } catch (error) {
      console.error(error);
      errors.push({
        ...(isErrorItem(error)
          ? error
          : createErrorMsgItem(
            EApiErrorType.INTERNAL_ERROR,
            "Unexpected error while attaching child"
          )),
        index,
        child: entry,
      });
    }
  }
  return { data, errors };
}
