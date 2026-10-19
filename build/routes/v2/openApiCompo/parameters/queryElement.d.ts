/**
 * @swagger
 * components:
 *   parameters:
 *     queryElement:
 *       in: query
 *       name: element
 *       required: false
 *       description: |-
 *         Select data from the SpinalNode element.
 *
 *         - `true` or an empty value returns the whole element.
 *         - Omitting the parameter or using `false` omits the element without loading it.
 *         - A comma-separated list of dot paths selects fields, preserving their structure (for example `value,metadata.unit,samples.0`).
 *         - Array indexes are zero-based; unselected earlier entries appear as `null`.
 *         - A missing element returns `null` without creating one. Missing fields are omitted.
 *         - Directly embedded Models are traversed. Nested pointers return `{ "$ptr": dynamicId }` without loading their targets; unset pointer IDs are `null`.
 *         - Dot paths cannot address field names containing dots. Internal Model members are not selectable.
 *         - Cycles, non-finite numbers, depth greater than 32, more than 10000 visited Models, or arrays longer than 10000 produce HTTP 500.
 *       schema:
 *         type: string
 *       examples:
 *         all:
 *           summary: Return the whole element
 *           value: "true"
 *         selected:
 *           summary: Selected fields, nested fields and an array entry
 *           value: "value,metadata.unit,samples.0"
 *         omitted:
 *           summary: Omit the element without loading it
 *           value: "false"
 */
