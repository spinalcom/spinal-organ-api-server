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
 *     queryFilter:
 *       in: query
 *       name: filter
 *       style: deepObject
 *       explode: true
 *       description: >-
 *         Filter nodes based on various attributes and conditions.
 *         There are multiple ways to specify filters.
 *         But every filter condition is combined using `AND` logical operator.
 *
 *         - A complete JSON filter syntax `filter={"info.virtual":{"eq":"false"}}`.
 *
 *         - A JSON operator objects syntax: `filter[info.virtual]={"eq":"false"}`
 *
 *         - Bracket syntax `filter[info.virtual][eq]=value`.
 *
 *
 *         In the examples above, replace `info.virtual` and `eq` with the appropriate `field` and `operator` for your use case.
 *
 *         - Fields are `info.key`, `attributes.category.attribute`, `dynamicId` or `server_id`.
 *
 *         - Operators are `eq`, `ne`, `gt`, `gte`, `lt`, `lte` and `exists`.
 *             - Operators default to eq, it shortens the syntax to `filter[info.virtual]=false`
 *             - for the operator `exists`, use `exists=true` for checking presence or `exists=false` for checking absence.
 *               Empty strings, false and 0 count as present.
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
 *       example:
 *         info.virtual:
 *           eq: 'false'
 */
//# sourceMappingURL=queryFilter.js.map