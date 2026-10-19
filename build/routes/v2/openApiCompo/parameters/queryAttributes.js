/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
//# sourceMappingURL=queryAttributes.js.map