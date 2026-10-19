/**
 * @swagger
 * components:
 *   parameters:
 *     queryAttributes:
 *       in: query
 *       name: attributes
 *       required: false
 *       description: |-
 *         Select categorized attributes for the response. Does not affect filtering.
 *
 *         - `true` will include all attributes from all categories.
 *         - `false` or omitting the parameter will include no attributes.
 *         - A comma-separated list like `Spatial/area,Spatial/volume,OtherCategories`. Inputting only the category will include all the attributes within that category.
 *         - Missing attributes and empty categories are omitted. Names are case-sensitive.
 *       schema:
 *         type: string
 *       examples:
 *         missing:
 *           summary: --
 *           value: ''
 *         all:
 *           summary: All attributes in all categories
 *           value: 'true'
 *         none:
 *           summary: Omit attributes from the response
 *           value: 'false'
 *         category:
 *           summary: All attributes in one category
 *           value: 'Spatial'
 *         selected:
 *           summary: Selected attributes in one category
 *           value: 'Spatial/area,Spatial/volume'
 *         mixed:
 *           summary: Selected attributes and a complete category
 *           value: 'Spatial/area,Technical/Code,OtherCategories'
 */
