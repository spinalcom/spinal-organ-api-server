/**
 * @swagger
 * components:
 *   parameters:
 *     queryAttributes:
 *       in: query
 *       name: attributes
 *       required: false
 *       description: Add attributes to the response.
 *
 *         - `true` will include all attributes from all categories.
 *
 *         - `false` or omitting the parameter will include no attributes.
 *
 *         - A comma-separated list like `Spatial/area,Spatial/volume,OtherCategories`. Inputting only the category will include all the attributes within that category.
 *       schema:
 *         type: string
 *       example: true
 */
