"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const express_zod_safe_1 = __importDefault(require("express-zod-safe"));
const spinal_model_graph_1 = require("spinal-model-graph");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const loadAndValidateNode_1 = require("../../../utilities/loadAndValidateNode");
const sendResponseError_1 = require("../../../utilities/v2/errorHandler/sendResponseError");
const RELATION_TYPES = [
    spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE,
    spinal_model_graph_1.SPINAL_RELATION_LST_PTR_TYPE,
    spinal_model_graph_1.SPINAL_RELATION_TYPE,
];
module.exports = function (logger, app, middleware) {
    /**
     * @swagger
     * /api/v2/node/{parentId}/child-relationships/{relationName}/children/{childId}:
     *   delete:
     *     security:
     *       - bearerAuth: [write]
     *     tags: [node]
     *     summary: Detach a child from every matching relationship
     *     description: |-
     *       Removes the specified parent-to-child link from every supported relationship type that has the exact relation name.
     *
     *       Neither node is deleted; other links, descendants, info, elements and attributes are preserved.
     *       Graph-managed modification timestamps may change.
     *
     *       - Both nodes must be accessible to the current profile, even when no matching link exists.
     *       - Relation-name matching is exact and case-sensitive; no regex or OR matching is performed.
     *       - URL-encode the relation name. Encoded slashes require router/proxy support.
     *       - A missing relationship or child membership returns `alreadyDetached` without mutation.
     *       - `relationTypes` lists only types from which the child was detached; it is empty when already detached.
     *       - Empty relationships are retained. Node and relation context memberships are not modified.
     *       - Detachment applies globally across contexts; `contextDynamicId` and all other query parameters are rejected.
     *       - Only `PtrLst`, `LstPtr` and `Ref` are supported.
     *       - Writes are not transactional or locked. Concurrent graph changes can cause the operation to fail.
     *     parameters:
     *       - $ref: '#/components/parameters/nodeChildrenParentId'
     *       - name: childId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 9007199254740991
     *       - name: relationName
     *         in: path
     *         required: true
     *         description: Exact nonblank relation name, matched case-sensitively across supported relation types.
     *         schema:
     *           type: string
     *           minLength: 1
     *     responses:
     *       200:
     *         description: Matching links detached or already absent.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               required: [data]
     *               properties:
     *                 data:
     *                   type: object
     *                   required: [parentDynamicId, childDynamicId, relationName, relationTypes, status]
     *                   properties:
     *                     parentDynamicId:
     *                       type: integer
     *                     childDynamicId:
     *                       type: integer
     *                     relationName:
     *                       type: string
     *                     relationTypes:
     *                       type: array
     *                       items:
     *                         type: string
     *                         enum: [PtrLst, LstPtr, Ref]
     *                     status:
     *                       type: string
     *                       enum: [detached, alreadyDetached]
     *       400:
     *         $ref: '#/components/responses/IErrorItemRes400'
     *       500:
     *         $ref: '#/components/responses/IErrorItemRes500'
     */
    app.delete('/api/v2/node/:parentId/child-relationships/:relationName/children/:childId', (0, express_zod_safe_1.default)({
        params: zod_1.z.strictObject({
            parentId: zod_1.z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
            childId: zod_1.z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
            relationName: zod_1.z.string().refine((name) => name.trim().length > 0, {
                message: 'relationName must not be blank',
            }),
        }),
        query: zod_1.z.strictObject({}),
    }), async (req, res) => {
        try {
            const { parentId, childId, relationName } = req.params;
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const parent = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, parentId, profileId);
            const child = await (0, loadAndValidateNode_1.loadAndValidateNode)(middleware, childId, profileId);
            const detachedRelationTypes = [];
            for (const relationType of RELATION_TYPES) {
                const relation = parent.children
                    .getElement(relationType)
                    ?.getElement(relationName);
                const exists = relation?.getChildrenIds().includes(child.getId().get()) ?? false;
                if (exists) {
                    await parent.removeChild(child, relationName, relationType);
                    detachedRelationTypes.push(relationType);
                }
            }
            return res.status(200).json({
                data: {
                    parentDynamicId: parentId,
                    childDynamicId: childId,
                    relationName,
                    relationTypes: detachedRelationTypes,
                    status: detachedRelationTypes.length
                        ? 'detached'
                        : 'alreadyDetached',
                },
            });
        }
        catch (error) {
            (0, sendResponseError_1.sendResponseError)(res, error);
        }
    });
};
//# sourceMappingURL=deleteNodeChildByName.js.map