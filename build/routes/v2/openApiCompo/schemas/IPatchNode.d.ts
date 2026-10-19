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
