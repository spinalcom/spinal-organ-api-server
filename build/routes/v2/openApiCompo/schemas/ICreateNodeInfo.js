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
 *     ICreateNodeInfo:
 *       type: object
 *       description: >-
 *         Information about the node to create. Additional scalar, object and array
 *         fields are accepted, including nested { "$modelRef": dynamicId } references loaded using the current profile.
 *         Administration rights may be required for $modelRef. Null and reserved Model member names are not supported.
 *         Info keys starting with `_` are forbidden at every nesting level, including objects inside arrays; invalid keys return HTTP 400.
 *         IDs and node type are assigned by the server;
 *         id, staticId, type and dynamicId are forbidden.
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the node. Floor, room and equipment names must be unique within the relevant parent relation.
 *           maxLength: 200
 *           minLength: 1
 *         color:
 *           type: string
 *           description: Six-digit hexadecimal color code, for example "#FFFFFF".
 *           pattern: "^#([A-Fa-f0-9]{6})$"
 *         icon:
 *           type: string
 *           description: Icon identifier for the node.
 *           minLength: 1
 *           maxLength: 200
 *       additionalProperties:
 *         $ref: '#/components/schemas/INodeElementValue'
 */
//# sourceMappingURL=ICreateNodeInfo.js.map