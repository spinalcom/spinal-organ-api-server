"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
* @swagger
* components:
*   schemas:
*     Position:
*       type: "object"
*       properties:
*         dynamicId:
*           type: "integer"
*         staticId:
*           type: "string"
*         name:
*           type: "string"
*         type:
*           type: "string"
*         info:
*           type: "object"
*           properties:
*             context:
*                  $ref: "#/components/schemas/Context"
*             building:
*                  $ref: "#/components/schemas/Building"
*             floor:
*                  $ref: "#/components/schemas/Floor"
*             room:
*                  $ref: "#/components/schemas/Room"
 */
/**
* @swagger
* components:
*   schemas:
*     RoomPosition:
*       type: "object"
*       properties:
*         dynamicId:
*           type: "integer"
*         staticId:
*           type: "string"
*         name:
*           type: "string"
*         type:
*           type: "string"
*         info:
*           type: "object"
*           properties:
*             context:
*                  $ref: "#/components/schemas/Context"
*             building:
*                  $ref: "#/components/schemas/Building"
*             floor:
*                  $ref: "#/components/schemas/Floor"
 */
/**
* @swagger
* components:
*   schemas:
*     StaticDetailsRoom:
*       type: "object"
*       properties:
*         dynamicId:
*           type: "integer"
*         staticId:
*           type: "string"
*         name:
*           type: "string"
*         type:
*           type: "string"
*         bimFileId:
*           type: "string"
*         version:
*           type: "number"
*         externalId:
*           type: "string"
*         dbid:
*           type: "string"
*         attributs:
*           type: "array"
*           items:
*                $ref: "#/components/schemas/Attributs"
*         controlEndpoint:
*           type: "object"
*           properties:
*             profileName:
*               type: "string"
*             endpoints:
*               type: array
*               items:
*                    $ref: "#/components/schemas/ControlEndpoint"
*         bimObjects:
*           type: "array"
*           items:
*                $ref: "#/components/schemas/Equipement"
*         groupParents:
*           type: "array"
*           items:
*                $ref: "#/components/schemas/Room"
 */
/**
* @swagger
* components:
*   schemas:
*     StaticDetailsEquipment:
*       type: "object"
*       properties:
*         dynamicId:
*           type: "integer"
*         staticId:
*           type: "string"
*         name:
*           type: "string"
*         type:
*           type: "string"
*         attributs:
*           type: "array"
*           items:
*                $ref: "#/components/schemas/Attributs"
*         controlEndpoint:
*           type: "object"
*           properties:
*             profileName:
*               type: "string"
*             endpoints:
*               type: array
*               items:
*                    $ref: "#/components/schemas/Room"
*         groupParents:
*           type: "array"
*           items:
*                $ref: "#/components/schemas/Room"
 */
/**
* @swagger
* components:
*  schemas:
*    InventoryRoomDetails:
*      type: object
*      properties:
*        dynamicId:
*          type: string
*        staticId:
*          type: integer
*          format: int64
*        type:
*          type: string
*        name:
*          type: string
*        inventories:
*          type: array
*          items:
*            $ref: '#/components/schemas/InventoryEquipmentCategory'
*    InventoryEquipmentCategory:
*      type: object
*      properties:
*        staticId:
*          type: string
*        dynamicId:
*          type: integer
*          format: int64
*        name:
*          type: string
*        type:
*          type: string
*        inventory:
*          type: array
*          items:
*            $ref: '#/components/schemas/InventoryEquipmentGroup'
*    InventoryEquipmentGroup:
*      type: object
*      properties:
*        staticId:
*          type: string
*        dynamicId:
*          type: integer
*          format: int64
*        name:
*          type: string
*        type:
*          type: string
*        equipments:
*          type: array
*          items:
*            $ref: '#/components/schemas/InventoryBIMObject'
*    InventoryBIMObject:
*      type: object
*      properties:
*        staticId:
*          type: string
*        dynamicId:
*          type: integer
*          format: int64
*        name:
*          type: string
*        type:
*          type: string
 */
/**
* @swagger
* components:
*  schemas:
*    Error:
*      type: object
*      properties:
*        dynamicId:
*          type: integer
*          format: int64
*        error:
*          type: string
*/
/**
 * @swagger
 * components:
 *   schemas:
 *     RoomReferenceObjectResponse:
 *       type: object
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 *         bimFileId:
 *           type: "string"
 *         infoReferencesObjects:
 *           type: "array"
 *           items:
 *             $ref: '#/components/schemas/Equipement'
 */
//# sourceMappingURL=interfacesGeoContext.js.map