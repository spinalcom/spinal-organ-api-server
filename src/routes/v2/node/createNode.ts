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

import validate from 'express-zod-safe';
import type { Express } from 'express';
import { SpinalContext } from 'spinal-model-graph';
import type { ISpinalAPIMiddleware } from '../../../interfaces';
import { getProfileId } from '../../../utilities/requestUtilities';
import { loadAndValidateNode } from '../../../utilities/loadAndValidateNode';
import { getNodeData } from '../../../utilities/v2/node/getNodeData';
import {
  createErrorMsgItem,
  isErrorItem,
} from '../../../utilities/v2/errorHandler/createErrorMsgItem';
import { EApiErrorType } from '../../../utilities/v2/errorHandler/EApiErrorType';
import { sendResponseError } from '../../../utilities/v2/errorHandler/sendResponseError';
import type { IErrorItem } from '../openApiCompo/schemas/IErrorItem';
import { createNodeSchema } from '../../../utilities/v2/node/creation/schema';
import { prepareNodeCreation } from '../../../utilities/v2/node/prepareNodeCreation';

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
   *       ### Info (required)
   *
   *       - Supply `info.name` and `info.type` as nonempty strings of at most 200 characters. This endpoint does not impose name uniqueness.
   *       - Additional fields accept strings, finite numbers, booleans, nested objects and arrays. `null` is not supported.
   *       - Additional field values, including values nested in objects or arrays, may use `$modelRef` syntax. See **Model references (`$modelRef`)** below.
   *       - `name` and `type` must remain strings, not reference objects. IDs (`id`, `staticId`, `dynamicId`) are assigned by the server and cannot be supplied.
   *       - Keys must not start with `_` or shadow Model members at any nesting level, including objects inside arrays.
   *
   *       ### Attributes (optional)
   *
   *       - Group values by category and label: `"attributes": { "Spatial": { "area": "20" } }`. Plain values must be strings, not numbers or booleans.
   *       - A value under a category and label may use `$modelRef` syntax instead of a string. See **Model references (`$modelRef`)** below for the target-type constraint and sharing behavior.
   *       - If omitted, no default attributes are added.
   *
   *       ### Element (optional)
   *
   *       - Supply an object directly in `element` to create a generic SpinalCore `Model`.
   *       - Values may be strings, finite numbers, booleans, nested objects or arrays. `null` is not supported.
   *       - Object keys must not start with `_` or shadow Model members (for example `get`, `set`, `constructor`, `model_id`).
   *       - Values nested in the element's objects or arrays may use `$modelRef` syntax. See **Model references (`$modelRef`)** below. The root element must remain an ordinary object.
   *       - The newly created element Model is passed to the SpinalNode constructor, which keeps it behind the node's element pointer.
   *       - If omitted, no element is created by this endpoint.
   *       - The response remains `INodeItem`; element contents are not included.
   *
   *       ### Model references (`$modelRef`)
   *
   *       Share a Model rather than copy its value in info, element or attribute values:
   *
   *       - Existing node: `{ "$modelRef": 7890123, "path": "info.name" }`. The current profile must have access to the target node.
   *       - Node being created: `{ "$modelRef": "self", "path": "info.name" }`. Forward references are supported.
   *       - Attribute value: `{ "$modelRef": 7890123, "path": "attr.Technical.Code" }`.
   *       - Attribute modification date (in info or element): `{ "$modelRef": 7890123, "path": "attr.Technical.Code.lastModificationDate" }`.
   *
   *       Attribute destinations require a `Str` target. References are resolved before parent attachment; invalid paths, incompatible targets and circular dependencies return HTTP 400.
   *
   *       See **`INodeElementModelReference`** in the schemas for the full syntax, supported paths, modification-date references and sharing behavior.
   *
   *       ### Results
   *
   *       - **201:** at least one attachment succeeded. Returns the node with all info and attributes.
   *       - Successful attachments are retained when others fail.
   *       - Failed entries are reported in `error`, including their zero-based index and requested parent/relation.
   *       - **400:** invalid input, or all attachments failed due to invalid parents or contexts.
   *       - **500:** unexpected failure; also used when all attachments fail and an internal error occurred.
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
   *                 $modelRef: 7890123
   *                 path: info.name
   *             parents:
   *               - parentDynamicId: 1234567
   *                 relationName: hasSensor
   *                 contextDynamicId: 6543210
   *               - parentDynamicId: 1234568
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
    '/api/v2/node',
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
                  'Unexpected error while attaching node to parent'
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
              'No parent attachment succeeded'
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
