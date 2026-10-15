/**
 *  @swagger
 * components:
 *   parameters:
 *     paramParentDynId:
 *       in: query
 *       name: parent-dynamic-id
 *       required: false
 *       description: filter the results by the dynamic ID of the parent node.
 *         If not provided, will search from the whole building.
 *         This id should correspond to an existing parent node of type from a Spatial context or Group, such as `geographicFloor` or `groupHasgeographicRoom`.
 *       example: "132456"
 *       schema:
 *         type: integer
 *         minimum: 1
 */
