/**
 * @swagger
 * components:
 *   parameters:
 *     queryInfo:
 *       in: query
 *       name: info
 *       required: false
 *       description: |-
 *         Select fields from `node.info` for the response. Does not affect filtering.
 *         - `true` or an empty value includes all info fields, including nested objects and arrays.
 *         - `false` omits the `info` property entirely.
 *         - Omitting the parameter uses the default fields (`staticId,name,type,color,icon,virtual,bimFileId,dbid`) if they are present in the node.
 *         - A comma-separated list like `staticId,name` will include only the `staticId` and `name` fields.
 *         - Dot paths select nested fields and zero-based array indexes, for example `metadata.unit,samples.0`. The selected structure is preserved; unselected earlier array entries are `null`.
 *         - `staticId` maps to the model's info.id; `id` is accepted as an alias in field lists.
 *
 *         Missing fields are omitted. Directly embedded Models are traversed, including `$modelRef` data; nested pointers return `{ "$ptr": dynamicId }` without loading.
 *         Cycles, non-finite numbers, depth greater than 32, more than 10000 visited Models, or arrays longer than 10000 produce HTTP 500.
 *         Dot paths cannot address literal dots in field names. Internal Model members are not selectable.
 *         The top-level `dynamicId` is always returned.
 *       schema:
 *         type: string
 *       examples:
 *         all:
 *           summary: All info, including objects and arrays
 *           value: 'true'
 *         none:
 *           summary: Omit info from the response
 *           value: 'false'
 *         selected:
 *           summary: Static ID, name and type
 *           value: 'staticId,name,type'
 *         nested:
 *           summary: Selected nested fields
 *           value: 'name,metadata.unit,metadata.device.value'
 *         array:
 *           summary: First sample and a field in the second sample
 *           value: 'samples.0,samples.1.value'
 */
