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

import type { INodeItemAttr } from './INodeItemAttr';
import type { INodeItemInfo } from './INodeItemInfo';

/**
 * @swagger
 * components:
 *   schemas:
 *     INodeItem:
 *       type: object
 *       required:
 *         - dynamicId
 *       properties:
 *         dynamicId:
 *           type: number
 *         parentDynamicId:
 *           description: given when the request use the parent-dynamic-id parameter
 *           type: number
 *         info:
 *           $ref: '#/components/schemas/INodeItemInfo'
 *         attributes:
 *           $ref: '#/components/schemas/INodeItemAttr'
 *       example:
 *         dynamicId: 123
 *         parentDynamicId: 456
 *         info:
 *           staticId: "abc123"
 *           name: "Node Name"
 *           type: "Node Type"
 *           color: "#FFFFFF"
 *           directModificationDate: 1627849200
 *         attributes:
 *           categoryName1_without_add-attributes-modification-date:
 *             attributeName1: "example value"
 *           categoryName2_with_add-attributes-modification-date:
 *             attributeName2:
 *               value: "example value"
 *               lastModification: 1627849200
 */
export interface INodeItem {
  dynamicId: number;
  parentDynamicId?: number;
  info?: INodeItemInfo;
  attributes?: INodeItemAttr;
}
