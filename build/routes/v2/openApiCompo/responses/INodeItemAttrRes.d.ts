/**
 * @swagger
 * components:
 *   responses:
 *     INodeItemAttrRes:
 *       description: Node retrieved or created successfully.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 $ref: '#/components/schemas/INodeItem'
 *               error:
 *                 type: array
 *                 description: Group-link failures after successful creation. The created node is retained. Omitted when there are no link errors.
 *                 items:
 *                   $ref: '#/components/schemas/IErrorItem'
 */
