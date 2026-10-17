/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateNodeElement:
 *       type: object
 *       description: |-
 *         Create a generic Model from this object. The node retains its element pointer.
 *         Nested values can reference a Model on an existing SpinalNode with `{ "$modelRef": 789012, "path": "info.name" }`.
 *         **The current profile must have access to the target SpinalNode specified by `$modelRef`.**
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
 *           path: info.name
 *         metadata:
 *           unit: Celsius
 *         samples: [20, 21.5]
 *     INodeElementModelReference:
 *       type: object
 *       additionalProperties: false
 *       required: [$modelRef, path]
 *       properties:
 *         $modelRef:
 *           type: integer
 *           minimum: 1
 *           maximum: 9007199254740991
 *           description: Dynamic ID of an existing SpinalNode. The current profile must have access to this target node.
 *         path:
 *           type: string
 *           description: |-
 *             Model to share from the target node. Supports `info.name`, nested paths like `info.metadata.unit`, `element` or `element.samples.0`, and `attr.Category.Label` for the categorized attribute's value Model.
 *             `info.id`, its alias `info.staticId`, and their descendant paths are forbidden. Referencing the whole `info` Model is also forbidden because it contains the node ID. Invalid paths return HTTP 400.
 *             Paths are case-sensitive, limited to 32 segments, and cannot traverse internal members or nested pointers.
 *             Category and label names containing dots cannot be addressed. Missing elements, categories, attributes or paths return HTTP 400. Resolving a missing element never creates it.
 *             References share the selected Model, not a copy. Repeated node/path pairs share the same resolved instance; each target node is loaded once per object creation.
 *           example: info.name
 *       example:
 *         $modelRef: 789012
 *         path: info.name
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
