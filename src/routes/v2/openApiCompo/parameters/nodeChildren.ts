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
