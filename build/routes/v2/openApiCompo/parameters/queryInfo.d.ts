/**
 * @swagger
 * components:
 *   parameters:
 *     queryInfo:
 *       in: query
 *       name: info
 *       required: false
 *       description: Add fields information to the response.
 *
 *         - `true` will include all fields and in the latter case.
 *
 *         - `false` or `omitting the parameter` will use the default fields (`staticId,name,type,color,icon,virtual,bimFileId,dbid`) if they are present in the node.
 *
 *         - A comma-separated list like `staticId,name` will include only the `staticId` and `name` fields.
 *       schema:
 *         type: string
 *       example: false
 */
