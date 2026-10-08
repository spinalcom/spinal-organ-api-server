/**
 *  @swagger
 * components:
 *   parameters:
 *     paramParentDynId:
 *       in: query
 *       name: parent-dynamic-id
 *       required: false
 *       description: filter the results by the dynamic ID of the parent node.
 *         if not provided, will search from the whole building.
 *       example: "132456"
 *       schema:
 *         type: integer
 *         minimum: 1
 */
