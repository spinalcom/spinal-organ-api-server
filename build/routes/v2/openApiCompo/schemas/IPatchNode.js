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
 *     IPatchNode:
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         info:
 *           $ref: '#/components/schemas/IPatchModelFields'
 *         element:
 *           $ref: '#/components/schemas/IPatchModelFields'
 *         attributes:
 *           type: object
 *           additionalProperties: false
 *           properties:
 *             set:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *             remove:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: false
 *                 required: [category, label]
 *                 properties:
 *                   category:
 *                     type: string
 *                     minLength: 1
 *                   label:
 *                     type: string
 *                     minLength: 1
 *             rename:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: false
 *                 required: [category, from, to]
 *                 properties:
 *                   category:
 *                     type: string
 *                     minLength: 1
 *                   from:
 *                     type: string
 *                     minLength: 1
 *                   to:
 *                     type: string
 *                     minLength: 1
 *     IPatchModelFields:
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         set:
 *           type: object
 *           additionalProperties:
 *             $ref: '#/components/schemas/INodeElementValue'
 *         remove:
 *           type: array
 *           items:
 *             type: string
 *         rename:
 *           type: array
 *           items:
 *             type: object
 *             additionalProperties: false
 *             required: [from, to]
 *             properties:
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 */
//# sourceMappingURL=IPatchNode.js.map