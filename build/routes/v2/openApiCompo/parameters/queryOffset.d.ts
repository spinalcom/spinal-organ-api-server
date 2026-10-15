/**
 * @swagger
 * components:
 *   parameters:
 *     queryOffset:
 *       in: query
 *       name: offset
 *       description: Number of matching nodes to skip.
 *         As the maximum number of matching nodes returned is limited to `200`, use this parameter to retrieve subsequent pages of results.
 *       schema:
 *         type: integer
 *         minimum: 0
 *         default: 0
 */
