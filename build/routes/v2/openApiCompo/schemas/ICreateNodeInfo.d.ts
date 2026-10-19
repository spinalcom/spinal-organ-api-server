/**
 * @swagger
 * components:
 *   schemas:
 *     ICreateNodeInfo:
 *       type: object
 *       description: >-
 *         Information about the node to create. Additional scalar, object and array
 *         fields are accepted, including nested { "$modelRef": nodeDynamicId, "path": "info.name" } references.
 *         The current profile must have access to the target SpinalNode specified by $modelRef.
 *         Use { "$modelRef": "self", "path": "info.unit" } to share a Model from the node being created, including forward references. Supplied and default categorized values can be targeted with attr.Category.Label. Self does not require a dynamic ID.
 *         Missing self paths, circular dependencies and ancestor embedding return HTTP 400 before attachment.
 *         Paths support info fields, element and attr.Category.Label (the attribute value Model); references share the selected Model. The whole info Model, info.id, info.staticId and descendants of those ID fields are forbidden. Missing or invalid paths return HTTP 400.
 *         Null and reserved Model member names are not supported.
 *         Info keys starting with `_` are forbidden at every nesting level, including objects inside arrays; invalid keys return HTTP 400.
 *         IDs and node type are assigned by the server;
 *         id, staticId, type and dynamicId are forbidden.
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the node. Floor, room and equipment names must be unique within the relevant parent relation.
 *           maxLength: 200
 *           minLength: 1
 *         color:
 *           type: string
 *           description: Six-digit hexadecimal color code, for example "#FFFFFF".
 *           pattern: "^#([A-Fa-f0-9]{6})$"
 *         icon:
 *           type: string
 *           description: Icon identifier for the node.
 *           minLength: 1
 *           maxLength: 200
 *       additionalProperties:
 *         $ref: '#/components/schemas/INodeElementValue'
 */
