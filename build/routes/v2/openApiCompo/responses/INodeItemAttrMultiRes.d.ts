/**
 * @swagger
 * components:
 *   responses:
 *     INodeItemAttrMultiRes:
 *       description: Nodes retrieved successfully.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: array
 *                 description: Retrieved nodes. Room and equipment lists return at most 200 items; floor lists are not paginated.
 *                 items:
 *                   $ref: '#/components/schemas/INodeItem'
 *               offset:
 *                 type: integer
 *                 description: Requested number of matching nodes skipped. Returned by paginated room and equipment lists.
 *               total:
 *                 type: integer
 *                 description: Number of eligible children before filtering when a parent-dynamic-id is supplied. Omitted for building-wide traversal and floor lists. This is not a count of filter matches.
 *               errors:
 *                 type: array
 *                 description: List of errors encountered during the request.
 *                 items:
 *                   $ref: '#/components/schemas/IErrorItem'
 */
