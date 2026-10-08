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
 *                 items:
 *                   $ref: '#/components/schemas/INodeItem'
 *               errors:
 *                 type: array
 *                 description: List of errors encountered during the request.
 *                 items:
 *                   $ref: '#/components/schemas/IErrorItem'
 */
