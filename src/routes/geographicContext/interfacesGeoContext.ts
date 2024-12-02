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

/**
* @swagger
* components:
*   schemas:
*     Building:
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
*         adress:
*           type: "string"
*         area:
*           type: "integer"
 */

export interface Building {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string,
  address: string,
  area: number | string
}




/**
* @swagger
* components:
*   schemas:
*     Floor:
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
 */

export interface Floor {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string
}

/**
* @swagger
* components:
*   schemas:
*     FloorDetails:
*       type: "object"
*       properties:
*         area:
*           type: "integer"
*         bimFileId:
*           type: "string"
*         _bimObjects:
*           type: "array"
*           items:
*             type: "object"
*             properties:
*               staticId:
*                 type: "string"
*               name:
*                 type: "string"
*               type:
*                 type: "string"
*               version:
*                 type: "integer"
*               externalId:
*                 type: "string"
*               dbid:
*                 type: "integer"
*/

export interface FloorDetails {
  area: number,
  dbIds: []
}

/**
* @swagger
* components:
*   schemas:
*     Room:
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
 */

export interface Room {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string
}


/**
* @swagger
* components:
*   schemas:
*     ControlEndpoint:
*       type: "object"
*       properties:
*         dynamicId:
*           type: "integer"
*         staticId:
*           type: "string"
*         name:
*           type: "string"
*         category:
*           type: "string"
*         value:
*           oneOf:
*             - type: string
*             - type: integer
*             - type: boolean
 */

/**
* @swagger
* components:
*   schemas:
*     RoomDetails:
*       type: "object"
*       properties:
*         area:
*           type: "integer"
*         bimFileId:
*           type: "string"
*         _bimObjects:
*           type: "array"
*           items:
*             type: "object"
*             properties:
*               staticId:
*                 type: "string"
*               name:
*                 type: "string"
*               type:
*                 type: "string"
*               version:
*                 type: "integer"
*               externalId:
*                 type: "string"
*               dbid:
*                 type: "integer"
*     RoomDetailsWithId:
*       type: "object"
*       properties:
*         dynamicId:
*           type: "integer"
*         area:
*           type: "integer"
*         bimFileId:
*           type: "string"
*         _bimObjects:
*           type: "array"
*           items:
*             type: "object"
*             properties:
*               staticId:
*                 type: "string"
*               name:
*                 type: "string"
*               type:
*                 type: "string"
*               version:
*                 type: "integer"
*               externalId:
*                 type: "string"
*               dbid:
*                 type: "integer"
*/

export interface RoomDetails {
  area: number,
  dbIds: []
}

/**
* @swagger
* components:
*   schemas:
*     Equipement:
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
 */

export interface Equipement {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string,
  bimFileId: string,
  version: number,
  externalId: string,
  dbid: number,
}


/**
* @swagger
* components:
*   schemas:
*     EndPointRoom:
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
*         currentValue:
*           type: "integer"
 */

export interface EndPointRoom {
  dynamicId: number,
  staticId: string,
  name: string,
  type: string,
  currentValue: number,
  unit: string

}


/**
* @swagger
* components:
*   schemas:
*     Note:
*       type: "object"
*       properties:
*         date:
*           type: "integer"
*         type:
*           type: "string"
*         message:
*           type: "string"
 */

export interface Note {
  date: number | string,
  type: string,
  message: string,
}

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
*     StaticDetailsFloor:
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
*         attributsList:
*           type: "array"
*           items:
*                $ref: "#/components/schemas/Attributs"
*         controlEndpoint:
*           type: "array"
*           items:
*               $ref: "#/components/schemas/ControlEndpointProfileAndEndpoints"
*         endpoints:
*           type: "array"
*           items:
*               $ref: "#/components/schemas/EndPointRoom"
*         tickets:
*           type: "array"
*           items:
*               $ref: "#/components/schemas/Ticket"
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
*         attributeList:
*           type: "array"
*           items:
*                $ref: "#/components/schemas/Attributs"
*         controlEndpoints:
*           type: "array"
*           items:
*               $ref: "#/components/schemas/ControlEndpointProfileAndEndpoints"
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
*             $ref: "#/components/schemas/Attributs"
*         controlEndpoint:
*           type: "object"
*           properties:
*             profileName:
*               type: "string"
*             endpoints:
*               type: array
*               items:
*                 $ref: "#/components/schemas/Room"
*         groupParents:
*           type: "array"
*           items:
*             $ref: "#/components/schemas/Room"
 */


/**
* @swagger
* components:
*  schemas:
*    ControlEndpointProfileAndEndpoints:
*      type: object
*      properties:
*        profileName:
*          type: string
*        endpoints:
*          type: array
*          items:
*            $ref: "#/components/schemas/ControlEndpoint"
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




