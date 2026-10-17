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

import validate from "express-zod-safe";
import type { Express } from "express";
import { SpinalContext } from "spinal-model-graph";
import type { ISpinalAPIMiddleware } from "../../../interfaces";
import { getProfileId } from "../../../utilities/requestUtilities";
import { loadAndValidateNode } from "../../../utilities/loadAndValidateNode";
import { getNodeData } from "../../../utilities/v2/node/getNodeData";
import {
  createErrorMsgItem,
  isErrorItem,
} from "../../../utilities/v2/errorHandler/createErrorMsgItem";
import { EApiErrorType } from "../../../utilities/v2/errorHandler/EApiErrorType";
import { sendResponseError } from "../../../utilities/v2/errorHandler/sendResponseError";
import type { IErrorItem } from "../openApiCompo/schemas/IErrorItem";
import { createNodeSchema } from "../../../utilities/v2/node/creation/schema";
import { prepareNodeCreation } from "../../../utilities/v2/node/prepareNodeCreation";

module.exports = function (
  logger: any,
  app: Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v2/node:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - write
   *     summary: Create a node and attach it to parents
   *     description: |-
   *       Create one `SpinalNode` with a caller-supplied name and type.
   *
   *       ### Parents and relations
   *
   *       - Supply at least one entry in `parents`. All entries attach the **same node**.
   *       - Each entry requires `parentDynamicId` and `relationName`.
   *       - `relationType` defaults to `PtrLst`; `LstPtr` and `Ref` are also supported.
   *       - With `contextDynamicId`, load a `SpinalContext` and use `addChildInContext`.
   *       - Without a context, use `addChild`.
   *       - Parents and contexts are loaded using the current profile.
   *
   *       ### Element (optional)
   *
   *       - Supply an object directly in `element` to create a generic SpinalCore `Model`.
   *       - Values may be strings, finite numbers, booleans, nested objects or arrays. `null` is not supported.
   *       - Object keys must not start with `_` or shadow Model members (for example `get`, `set`, `constructor`, `model_id`).
   *       - Use `{ "$modelRef": 789012, "path": "info.name" }` to share a Model from an existing SpinalNode. References work in nested objects and arrays.
   *       - Use `{ "$modelRef": "self", "path": "info.unit" }` to share a Model from the node being created. Forward references work regardless of field order, including across info and element. `attr.Category.Label` can target supplied or default attribute values.
   *       - Self references do not load a node by dynamic ID. Missing self paths, circular dependencies and embedding an ancestor into itself return HTTP 400 before parent attachment.
   *       - A reference object must contain exactly `$modelRef` (a positive safe integer node ID or `"self"`) and `path`. `$modelRef` is reserved, and cannot be a field on the root element.
   *       - **The current profile must have access to the target SpinalNode specified by `$modelRef`.**
   *       - Paths support `info.name`, `info.metadata.unit`, `element.samples.0`, and `attr.Category.Label` (the attribute value Model). `element` selects the whole element Model. `info`, `info.id`, `info.staticId` and descendants of these ID fields are forbidden to prevent sharing the node ID. Missing or invalid paths return HTTP 400; nested pointers are not traversed.
   *       - Referenced Models are assigned directly as attributes, not copied or wrapped in additional pointers. Each target node is loaded once per object creation; repeated node/path pairs share the same Model.
   *       - The newly created element Model is passed to the SpinalNode constructor, which keeps it behind the node's element pointer.
   *       - All references are validated and loaded before any parent attachment. Invalid or inaccessible references reject the request.
   *       - If omitted, no element is created by this endpoint.
   *       - The response remains `INodeItem`; element contents are not included.
   *
   *       ### Results
   *
   *       - **201:** at least one attachment succeeded. Returns the node with all info and attributes.
   *       - Extra info supports nested objects, arrays and `$modelRef` values with the same rules as element data. The current profile must have access to the target SpinalNode specified by `$modelRef`.
   *       - Info keys starting with `_` are forbidden at every nesting level, including objects inside arrays. Invalid keys return HTTP 400.
   *       - Successful attachments are retained when others fail.
   *       - Failed entries are reported in `error`, including their zero-based index and requested parent/relation.
   *       - **400:** invalid input, or all attachments failed due to invalid parents or contexts.
   *       - **500:** unexpected failure; also used when all attachments fail and an internal error occurred.
   *       - No uniqueness constraint is imposed on the name. No default attributes are added.
   *     tags:
   *       - node
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - info
   *               - parents
   *             properties:
   *               info:
   *                 type: object
   *                 required:
   *                   - name
   *                   - type
   *                 description: Info fields, including nested objects, arrays and $modelRef values. Keys starting with an underscore are forbidden at every nesting level, including objects inside arrays (HTTP 400). IDs (id, staticId, dynamicId) are assigned by the server and cannot be supplied.
   *                 properties:
   *                   name:
   *                     type: string
   *                     minLength: 1
   *                     maxLength: 200
   *                   type:
   *                     type: string
   *                     minLength: 1
   *                     maxLength: 200
   *                 additionalProperties:
   *                   $ref: '#/components/schemas/INodeElementValue'
   *               attributes:
   *                 $ref: '#/components/schemas/ICreateNodeItemAttr'
   *               element:
   *                 $ref: '#/components/schemas/ICreateNodeElement'
   *               parents:
   *                 type: array
   *                 minItems: 1
   *                 items:
   *                   $ref: '#/components/schemas/INodeParentAttachment'
   *           example:
   *             info:
   *               name: My sensor
   *               type: sensor
   *             attributes:
   *               Technical:
   *                 Code: "001"
   *             element:
   *               value: 21.5
   *               unit: Celsius
   *               enabled: true
   *               code:
   *                 $modelRef: "self"
   *                 path: attr.Technical.Code
   *               device:
   *                 $modelRef: 789012
   *                 path: info.name
   *             parents:
   *               - parentDynamicId: 123456
   *                 relationName: hasSensor
   *                 contextDynamicId: 654321
   *               - parentDynamicId: 123457
   *                 relationName: hasSensor
   *                 relationType: PtrLst
   *     responses:
   *       201:
   *         description: Node created with at least one successful parent attachment.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required:
   *                 - data
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/INodeItem'
   *                 error:
   *                   type: array
   *                   description: Failed attachments. Omitted if all attachments succeeded.
   *                   items:
   *                     $ref: '#/components/schemas/INodeParentAttachmentError'
   *       400:
   *         description: Invalid request, inaccessible or invalid referenced element, or no parent attachment succeeded. When all attachments fail, errors contains the per-entry failures.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/INodeAttachmentFailure'
   *       500:
   *         description: Unexpected error, or all attachments failed with at least one internal error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/INodeAttachmentFailure'
   */
  app.post(
    "/api/v2/node",
    validate({
      body: createNodeSchema,
    }),
    async (req, res) => {
      try {
        const { info, attributes, parents, element: elementRequest } = req.body;
        const profileId = getProfileId(req);
        const node = await prepareNodeCreation(
          info.name,
          info.type,
          info,
          elementRequest,
          attributes,
          undefined,
          spinalAPIMiddleware,
          profileId
        );
        const errors: (IErrorItem & {
          index: number;
          parent: (typeof parents)[number];
        })[] = [];
        let attached = false;
        for (const [index, parent] of parents.entries()) {
          try {
            const parentNode = await loadAndValidateNode(
              spinalAPIMiddleware,
              parent.parentDynamicId,
              profileId
            );
            if (parent.contextDynamicId !== undefined) {
              const context = await loadAndValidateNode(
                spinalAPIMiddleware,
                parent.contextDynamicId,
                profileId
              );
              if (!(context instanceof SpinalContext)) {
                throw createErrorMsgItem(
                  EApiErrorType.INVALID_LOAD_NODE_TYPE,
                  `Node ${parent.contextDynamicId} is not a SpinalContext`
                );
              }
              await parentNode.addChildInContext(
                node,
                parent.relationName,
                parent.relationType,
                context
              );
            } else {
              await parentNode.addChild(
                node,
                parent.relationName,
                parent.relationType
              );
            }
            attached = true;
          } catch (error) {
            console.error(error);
            const item = isErrorItem(error)
              ? error
              : createErrorMsgItem(
                EApiErrorType.INTERNAL_ERROR,
                "Unexpected error while attaching node to parent"
              );
            errors.push({ ...item, index, parent });
          }
        }
        if (!attached) {
          const internal = errors.some(
            (error) => error.errorType === EApiErrorType.INTERNAL_ERROR
          );
          return res.status(internal ? 500 : 400).json({
            ...createErrorMsgItem(
              internal
                ? EApiErrorType.INTERNAL_ERROR
                : EApiErrorType.INVALID_REQUEST,
              "No parent attachment succeeded"
            ),
            errors,
          });
        }
        const data = await getNodeData(node, true, true);
        return res.status(201).json({
          data,
          error: errors.length > 0 ? errors : undefined,
        });
      } catch (error: any) {
        sendResponseError(res, error);
      }
    }
  );
};
