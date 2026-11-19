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
 *     ICreateNodeElement:
 *       type: object
 *       description: |-
 *         Create a generic Model from this object. The node retains its element pointer.
 *
 *         - Nested values can reference a Model on an existing SpinalNode with `{ "$modelRef": 7890123, "path": "info.name" }`.
 *         - Use `{ "$modelRef": "self", "path": "info.unit" }` to share a Model from the node being created. Forward references work across info and element regardless of field order; self attribute paths can target supplied or default categorized values.
 *         - Missing self paths, circular dependencies and ancestor embedding return HTTP 400 before attachment. Self does not load a node by dynamic ID.
 *
 *         **The current profile must have access to the target SpinalNode specified by `$modelRef`.**
 *
 *         - References are loaded using the current profile and assigned directly as Model attributes, not copied or wrapped in additional pointers. When used as an attribute value, the referenced Model must be a `Str`.
 *         - Keys must not start with an underscore, shadow Model members, or equal `$modelRef` on an ordinary object.
 *         - The root element must be an ordinary object, not a reference.
 *       additionalProperties:
 *         $ref: '#/components/schemas/INodeElementValue'
 *       not:
 *         required: [$modelRef]
 *       example:
 *         value: 21.5
 *         enabled: true
 *         device:
 *           $modelRef: 7890123
 *           path: info.name
 *         metadata:
 *           unit: Celsius
 *         samples: [20, 21.5]
 *     INodeElementModelReference:
 *       type: object
 *       description: |-
 *         Share an existing SpinalCore Model instead of copying its JSON value.
 *         A reference object contains exactly two properties: `$modelRef` and `path`.
 *
 *         ### Choosing a target
 *
 *         - `{ "$modelRef": 7890123, "path": "info.name" }` selects the name Model of an existing node. Use its numeric **dynamic ID**, not its static ID or a quoted numeric string. The node must be accessible to the current profile.
 *         - `{ "$modelRef": "self", "path": "info.name" }` selects the name Model of the node being created; no ID or additional node load is needed.
 *         - Place references in additional info fields, nested element objects or arrays, or directly as categorized attribute values. Required creation fields such as `info.name` and `info.type` still require strings; the root `element` must remain an ordinary object.
 *
 *         ### Paths
 *
 *         | Path | Selected Model |
 *         | --- | --- |
 *         | `info.name` | Node name (`Str`) |
 *         | `info.metadata.unit` | Nested info field |
 *         | `element` | Whole existing element |
 *         | `element.samples.0` | First entry of an element array (zero-based index) |
 *         | `attr.Technical.Code` | Categorized attribute value (`Str`) |
 *         | `attr.Technical.Code.lastModificationDate` | Categorized attribute modification date (`Val`) |
 *
 *         ### Sharing behavior
 *
 *         - This is a shared Model, not a computed expression or a lookup performed on every read. Updating that Model in place is visible through every reference to it; replacing it with another Model does not retarget existing references.
 *         - For example, an attribute pointing to `self` / `info.name` reflects a subsequent PATCH that sets the node's name.
 *         - API responses serialize the selected value, not the `$modelRef` request object.
 *         - Referencing an attribute value does not automatically share its modification date. To expose the same date, add a separate info or element field referencing `attr.Technical.Code.lastModificationDate`.
 *         - Attribute destinations accept only `Str` targets. A modification-date `Val`, number, object or array Model cannot be used as an attribute value (HTTP 400).
 *
 *         Missing paths, invalid target types and circular self dependencies return HTTP 400. Paths and the literal `"self"` are case-sensitive.
 *       additionalProperties: false
 *       required: [$modelRef, path]
 *       properties:
 *         $modelRef:
 *           oneOf:
 *             - type: integer
 *               minimum: 1
 *               maximum: 9007199254740991
 *             - type: string
 *               enum: [self]
 *           description: Dynamic ID of an existing SpinalNode accessible to the current profile, or "self" for the node being created. Self references resolve in memory and do not require a dynamic ID.
 *         path:
 *           type: string
 *           description: |-
 *             Model to share from the target node. Supports `info.name`, nested paths like `info.metadata.unit`, `element` or `element.samples.0`, and `attr.Category.Label` for the categorized attribute's value Model. Use `attr.Category.Label.lastModificationDate` to share that attribute's modification-date Model.
 *
 *             - `info.id`, its alias `info.staticId`, and their descendant paths are forbidden. Referencing the whole `info` Model is also forbidden because it contains the node ID. Invalid paths return HTTP 400.
 *             - Paths are case-sensitive, limited to 32 segments, and cannot traverse internal members or nested pointers.
 *             - Category and label names containing dots cannot be addressed. Missing elements, categories, attributes or paths return HTTP 400. Resolving a missing element never creates it.
 *             - `attr.Category.Label.lastModificationDate` shares the attribute's modification-date `Val` Model; `attr.Category.Label` still refers to the value Model.
 *             - References share the selected Model, not a copy. Repeated node/path pairs share the same resolved instance; each target node is loaded once per object creation.
 *           example: info.name
 *       example:
 *         $modelRef: 7890123
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
//# sourceMappingURL=ICreateNodeElement.js.map