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
  area: number
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
  currentValue: number
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
*         bimObjects:
*           type: "array"
*           items:
*                $ref: "#/components/schemas/Equipement"
*         groupParents:
*           type: "array"
*           items:
*                $ref: "#/components/schemas/Room"
 */
