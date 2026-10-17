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
/**
 * @swagger
 * components:
 *   schemas:
 *     INodeChildAttachment:
 *       type: object
 *       additionalProperties: false
 *       required: [childDynamicId, relationName]
 *       properties:
 *         childDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *         relationName:
 *           type: string
 *           minLength: 1
 *           description: Non-blank relation name; surrounding whitespace is trimmed.
 *         relationType:
 *           type: string
 *           enum: [PtrLst, LstPtr, Ref]
 *           default: PtrLst
 *         contextDynamicId:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *           description: Optional SpinalContext dynamic ID; uses addChildInContext when supplied.
 *     INodeChildAttachmentResult:
 *       allOf:
 *         - $ref: '#/components/schemas/INodeChildAttachment'
 *         - type: object
 *           required: [index, parentDynamicId, status]
 *           properties:
 *             index:
 *               type: integer
 *               minimum: 0
 *             parentDynamicId:
 *               type: integer
 *             status:
 *               type: string
 *               enum: [attached, alreadyAttached]
 *     INodeChildAttachmentError:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorItem'
 *         - type: object
 *           required: [index, child]
 *           properties:
 *             index:
 *               type: integer
 *               minimum: 0
 *             child:
 *               $ref: '#/components/schemas/INodeChildAttachment'
 *     INodeChildrenFailure:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorItem'
 *         - type: object
 *           properties:
 *             errors:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/INodeChildAttachmentError'
 */
//# sourceMappingURL=INodeChildAttachment.js.map