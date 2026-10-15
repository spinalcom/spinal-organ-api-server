/**
 * @swagger
 * components:
 *   responses:
 *     INodeItemAttrMultiRes:
 *       description: Retrieve Successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: array
 *                 description: List of retrieved nodes. There is a maximum of 200 items in one response.
 *                 maxItems: 200
 *                 items:
 *                   $ref: '#/components/schemas/INodeItem'
 *               offset:
 *                 type: integer
 *                 description: The offset of the retrieved nodes in the overall list.
 *               total:
 *                 type: integer
 *                 description: The total number of nodes available in the overall list. Will be given only if the total count is known or calculable.
 *               errors:
 *                 type: array
 *                 description: List of errors encountered during the request.
 *                 items:
 *                   $ref: '#/components/schemas/IErrorItem'
 */
