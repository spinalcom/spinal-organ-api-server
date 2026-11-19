/**
 * @swagger
 * components:
 *   parameters:
 *     queryOffset:
 *       in: query
 *       name: offset
 *       description: |-
 *         Number of matching nodes to skip **after filtering**.
 *
 *         - Must be a non-negative safe integer.
 *         - Pages contain at most **200 items**.
 *         - Use `0`, `200`, `400`, etc. for successive pages.
 *         - An offset beyond the matches returns `data: []`.
 *       schema:
 *         type: integer
 *         minimum: 0
 *         maximum: 9007199254740991
 *         default: 0
 */
