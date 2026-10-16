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
 *     ICreateNodeElement:
 *       type: object
 *       description: |-
 *         Create a generic Model from this object. The node retains its element pointer.
 *         Nested values can reference existing Models with `{ "$modelRef": 789012 }`.
 *         **Administration rights may be required to use `$modelRef`.**
 *         References are loaded using the current profile and assigned directly as Model attributes, not copied or wrapped in additional pointers.
 *         Keys must not start with an underscore, shadow Model members, or equal `$modelRef` on an ordinary object.
 *         The root element must be an ordinary object, not a reference.
 *       additionalProperties:
 *         $ref: '#/components/schemas/INodeElementValue'
 *       not:
 *         required: [$modelRef]
 *       example:
 *         value: 21.5
 *         enabled: true
 *         device:
 *           $modelRef: 789012
 *         metadata:
 *           unit: Celsius
 *         samples: [20, 21.5]
 *     INodeElementModelReference:
 *       type: object
 *       additionalProperties: false
 *       required: [$modelRef]
 *       properties:
 *         $modelRef:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *           description: Dynamic ID of an existing SpinalCore Model accessible through the current profile. Administration rights may be required. Repeated IDs share the same loaded Model.
 *       example:
 *         $modelRef: 789012
 *     INodeElementValue:
 *       description: Recursive non-null JSON value. Numbers must be finite; object keys must follow the Model attribute naming restrictions.
 *       oneOf:
 *         - type: string
 *         - type: number
 *         - type: boolean
 *         - type: array
 *           items:
 *             $ref: '#/components/schemas/INodeElementValue'
 *         - type: object
 *           description: Ordinary object; keys cannot equal $modelRef, start with an underscore or shadow Model members.
 *           not:
 *             required: [$modelRef]
 *           additionalProperties:
 *             $ref: '#/components/schemas/INodeElementValue'
 *         - $ref: '#/components/schemas/INodeElementModelReference'
 */
