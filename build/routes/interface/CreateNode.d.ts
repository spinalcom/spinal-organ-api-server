/**
 * @swagger
 * components:
 *   schemas:
 *     CreateNode:
 *       type: "object"
 *       properties:
 *         parentId:
 *           type: "integer"
 *           format: int64
 *           description: "The dynamic ID of the parent node"
 *         parentToChildRelationName:
 *           type: "string"
 *           description: "The name of the relation between the parent and the child"
 *         parentToChildRelationType:
 *           type: "string"
 *           description: "The type of the relation between the parent and the child"
 *           enum:
 *             - "PtrLst"
 *             - "LstPtr"
 *             - "Ref"
 *         addInContext:
 *           type: "boolean"
 *           description: "If true the node will be added in the context of the parent node else it will just be added as a child"
 *         contextId:
 *           type: "integer"
 *           format: "int64"
 *           description: "Required if 'addInContext' is true. The ID of the context to add the node to."
 *         name:
 *           type: "string"
 *           description: "The name of the node"
 *         type:
 *           type: "string"
 *           description: "The type of the node"
 *       additionalProperties:
 *         type: "string"
 *         description: "Any additional properties"
 *       required:
 *         - parentId
 *         - parentToChildRelationName
 *         - parentToChildRelationType
 *         - addInContext
 *         - name
 *         - type
 */
export interface CreateNode {
    parentId: number;
    parentToChildRelationName: string;
    parentToChildRelationType: string;
    addInContext: boolean;
    contextId?: number;
    name: string;
    type: string;
    [key: string]: number | string | boolean | undefined;
}
