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
/**
* @swagger
* components:
*   schemas:
*     ViewInfoNode:
*       type: object
*       description: |
*         One entry of the `nodes` map returned by `POST /api/v1/geographicContext/viewInfo2`.
*
*         The node's own dynamicId is the key it is stored under, so it is not repeated inside the
*         value. Reconstruct the tree by starting at the entries whose `parentId` is `null` and
*         following `children`.
*       properties:
*         parentId:
*           type: integer
*           format: int64
*           nullable: true
*           description: |
*             dynamicId of the parent, i.e. the key of the entry this node hangs from.
*             Null when the node is one of the traversal roots.
*           example: 24062000
*
*         children:
*           type: array
*           description: |
*             dynamicIds of the direct children, each one a key of the same `nodes` map. Lists only
*             the children actually traversed, so it reflects the `floorRef` / `roomRef` /
*             `equipements` flags of the request and the equipment group filter, not the full graph.
*             Empty for leaves.
*           items:
*             type: integer
*             format: int64
*           example: [24063912, 24063988]
*
*         dbId:
*           type: integer
*           nullable: true
*           description: |
*             Id of the object inside its BIM file, used to address it in the viewer.
*             Set only on `BIMObject`, `geographicReference`, `roomRef` and `floorRef` nodes;
*             null on the purely geographic ones.
*           example: 3365
*
*         bimFileAlias:
*           type: integer
*           nullable: true
*           description: |
*             Alias of the BIM file this object comes from, to be resolved against the response's
*             `bimFileAlias` dictionary. That dictionary is keyed by BIM file id with the alias as
*             value, so going from this number back to a file id means inverting it.
*             Null wherever `dbId` is null.
*           example: 1
*
*         type:
*           type: string
*           description: |
*             Type of the node. Usually its SpinalGraph type, with two exceptions the route
*             substitutes to record how the node was reached: reference objects found under a room
*             via `hasReferenceObject.ROOM` are reported as `roomRef`, and those found under a floor
*             via `hasReferenceObject` as `floorRef`.
*           enum:
*             - geographicContext
*             - geographicSite
*             - geographicBuilding
*             - geographicFloor
*             - geographicZone
*             - geographicRoom
*             - geographicReference
*             - BIMObject
*             - roomRef
*             - floorRef
*           example: geographicRoom
*/
//# sourceMappingURL=interfacesGeoContext.js.map