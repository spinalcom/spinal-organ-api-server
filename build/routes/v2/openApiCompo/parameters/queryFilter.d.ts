/**
 * @swagger
 * components:
 *   parameters:
 *     queryFilter:
 *       in: query
 *       name: filter
 *       style: deepObject
 *       explode: true
 *       description: |-
 *         All conditions are combined using **AND**. Filtering runs before pagination,
 *         independently of the requested `info` and `attributes`.
 *
 *         #### Equivalent URL formats
 *
 *         - Brackets: `filter[info.virtual][eq]=false`
 *         - JSON operators: `filter[info.virtual]={"eq":"false"}`
 *         - Full JSON: `filter={"info.virtual":{"eq":"false"}}`
 *         - Default equality: `filter[info.virtual]=false`
 *
 *         URL-encode JSON values when constructing URLs manually.
 *
 *         #### Fields and operators
 *
 *         - Fields: `info.key`, `attributes.category.attribute`, `dynamicId`, `server_id`.
 *         - `info.staticId` maps to the model's `info.id`.
 *         - `dynamicId` and `server_id` both refer to the node's dynamic ID.
 *         - Operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `exists`.
 *         - Scalar values default to **`eq`**.
 *         - Numeric comparisons require finite numbers, including for numeric attribute strings.
 *         - Equality preserves strings such as `"001"` and uses the stored type for numeric/boolean info.
 *
 *         #### Existence checks
 *
 *         - `"exists": true`: the value is present, including `""`, `false` and `0`.
 *         - `"exists": false`: the field is missing or undefined.
 *         - A missing category also makes its attributes absent.
 *         - Missing fields never match `eq`, `ne` or numeric comparisons.
 *
 *         #### Value restrictions
 *
 *         - Only scalar info fields are exposed.
 *         - Null and arrays are invalid filter values.
 *         - Strings starting with `{` or `[` are interpreted as JSON operator objects.
 *           Use explicit `eq` to compare literal strings starting with those characters.
 *       schema:
 *         type: object
 *         additionalProperties:
 *           oneOf:
 *             - type: string
 *             - type: number
 *             - type: boolean
 *             - type: object
 *               additionalProperties:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *       examples:
 *         equality:
 *           summary: Explicit equality on a boolean info field
 *           description: |-
 *             Swagger UI will render the filter parameter as a nested object editor. The example is equivalent to:
 *             `?filter[info.virtual][eq]=false`
 *           value:
 *             info.virtual:
 *               eq: false
 *         defaultEquality:
 *           summary: Scalar values default to equality
 *           description: |-
 *             Swagger UI will render the filter parameter as a nested object editor. The example is equivalent to:
 *             `?filter[info.name][eq]='Room A'&filter[info.virtual][eq]=false`
 *           value:
 *             info.name: 'Room A'
 *             info.virtual: false
 *         range:
 *           summary: Attribute numeric range (AND)
 *           description: |-
 *             Swagger UI will render the filter parameter as a nested object editor. The example is equivalent to:
 *             `?filter[attributes.Spatial.area][gte]=20&filter[attributes.Spatial.area][lt]=100`
 *           value:
 *             attributes.Spatial.area:
 *               gte: 20
 *               lt: 100
 *         exists:
 *           summary: Require one field and exclude nodes with another
 *           description: |-
 *             Swagger UI will render the filter parameter as a nested object editor. The example is equivalent to:
 *             `?filter[info.bimFileId][exists]=true&filter[attributes.Technical.Code][exists]=false`
 *           value:
 *             info.bimFileId:
 *               exists: true
 *             attributes.Technical.Code:
 *               exists: false
 *         notEqual:
 *           summary: Exclude a name (missing names do not match)
 *           description: |-
 *             Swagger UI will render the filter parameter as a nested object editor. The example is equivalent to:
 *             `?filter[info.name][ne]='Unassigned'`
 *           value:
 *             info.name:
 *               ne: 'Unassigned'
 *         combined:
 *           summary: Combine info, attribute and dynamic ID conditions
 *           description: |-
 *             Swagger UI will render the filter parameter as a nested object editor. The example is equivalent to:
 *             `?filter[info.virtual][eq]=false&filter[attributes.Technical.Code][eq]='001'&filter[dynamicId][gt]=1000000`
 *           value:
 *             info.virtual: false
 *             attributes.Technical.Code:
 *               eq: '001'
 *             dynamicId:
 *               gt: 1000000
 */
