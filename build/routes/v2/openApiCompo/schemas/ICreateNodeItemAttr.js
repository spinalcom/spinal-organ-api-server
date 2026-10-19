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
 *   schemas:
 *     ICreateNodeItemAttr:
 *       type: object
 *       description: |-
 *         Attributes to add to the node item. Values may be strings or `$modelRef` references to a `Str` Model.
 *
 *         Referenced models are shared, not copied. The target must be accessible to the current profile and resolve to a `Str`; other Model types are rejected with HTTP 400.
 *
 *         ### Examples
 *
 *         - Keep an attribute synchronized with this node's name: `"Name": { "$modelRef": "self", "path": "info.name" }`.
 *         - Share an existing node's string field: `"Name": { "$modelRef": 7890123, "path": "info.name" }`.
 *         - Share a categorized value: `"Code": { "$modelRef": 7890123, "path": "attr.Technical.Code" }`.
 *         - Plain values such as `"Area": "20"` remain independent strings. A numeric value such as `20` is not accepted.
 *
 *         `$modelRef` must be a numeric dynamic ID or the exact string `"self"`; `path` is case-sensitive.
 *         The target is the attribute's value only: its label, category and modification date remain separate.
 *         To share a source attribute's date, reference `attr.Technical.Code.lastModificationDate` from an info or element field, not from an attribute value.
 *         See `INodeElementModelReference` for supported paths and shared-Model behavior.
 *       additionalProperties:
 *         description: category of the node
 *         type: object
 *         additionalProperties:
 *           description: String value or reference to a `Str` Model.
 *           oneOf:
 *             - type: string
 *             - $ref: '#/components/schemas/INodeElementModelReference'
 *       example:
 *         Spatial:
 *           area: "20"
 *           name:
 *             $modelRef: self
 *             path: info.name
 *         Technical:
 *           Code:
 *             $modelRef: 7890123
 *             path: attr.Technical.Code
 */
//# sourceMappingURL=ICreateNodeItemAttr.js.map