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

/**
 * @swagger
 * components:
 *   schemas:
 *     INodeParentAttachment:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - parentDynamicId
 *         - relationName
 *       properties:
 *         parentDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *           description: Dynamic ID of an existing parent SpinalNode.
 *         relationName:
 *           type: string
 *           minLength: 1
 *           description: Non-blank relation name. Surrounding whitespace is trimmed.
 *         relationType:
 *           type: string
 *           enum: [PtrLst, LstPtr, Ref]
 *           default: PtrLst
 *         contextDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *           description: Optional dynamic ID of a SpinalContext. Uses addChildInContext when supplied.
 *     INodeParentAttachmentError:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorItem'
 *         - type: object
 *           required:
 *             - index
 *             - parent
 *           properties:
 *             index:
 *               type: integer
 *               minimum: 0
 *               description: Zero-based position of the failed entry in parents.
 *             parent:
 *               $ref: '#/components/schemas/INodeParentAttachment'
 *     INodeAttachmentFailure:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorItem'
 *         - type: object
 *           properties:
 *             errors:
 *               type: array
 *               description: Per-entry failures when no attachment succeeded.
 *               items:
 *                 $ref: '#/components/schemas/INodeParentAttachmentError'
 */
