/**
 * @swagger
 * components:
 *   parameters:
 *     nodeRelationsNodeId:
 *       in: path
 *       name: nodeId
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 9007199254740991
 *     nodeParentsContext:
 *       in: query
 *       name: contextDynamicId
 *       description: Optional accessible SpinalContext. The queried child, incoming relation and returned parent must belong to it. Relation pointers are loaded to check membership; parents of unrelated relations are not fetched.
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 9007199254740991
 *     nodeChildrenParentId:
 *       in: path
 *       name: parentId
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 9007199254740991
 *     nodeChildrenRelationType:
 *       in: query
 *       name: relationType
 *       description: Restrict relation type. Omitted means all supported types.
 *       schema:
 *         type: string
 *         enum: [PtrLst, LstPtr, Ref]
 *     nodeChildrenRelationName:
 *       in: query
 *       name: relationName
 *       description: Comma-separated exact relation names matched with OR across selected types. Whitespace is trimmed; empty names are rejected. Omitted means all names.
 *       example: hasSensor,hasDocument
 *       schema:
 *         type: string
 *         minLength: 1
 *     nodeChildrenContext:
 *       in: query
 *       name: contextDynamicId
 *       description: Optional accessible SpinalContext. Both relation and child must belong to it. Works without relationName; only direct children of this parent are returned. Relations outside the context are skipped before fetching their children.
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 9007199254740991
 */
