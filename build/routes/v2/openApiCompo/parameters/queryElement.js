/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
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
//# sourceMappingURL=queryElement.js.map