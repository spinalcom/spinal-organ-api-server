export interface IBimObjectsInfo {
    model: IModel;
    bimObjects: IBimObjectsItem[];
    notFound: number[];
}
export interface IModel {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
}
export interface IBimObjectsItem {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    children_relation_list: IRelationListItem[];
    parent_relation_list: IRelationListItem[];
    externalId: string;
    dbid: number;
    bimFileId: string;
    version: number;
}
export interface IRelationListItem {
    dynamicId: number;
    staticId: string;
    name: string;
    children_number: number;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     IBimObjectsInfo:
 *       type: object
 *       properties:
 *         model:
 *           $ref: "#/components/schemas/IModel"
 *         bimObjects:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/IBimObjectsItem"
 *         notFound:
 *           type: array
 *           items:
 *             type: number
 *     IModel:
 *       type: object
 *       properties:
 *         dynamicId :
 *           type: number
 *         staticId:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *       required:
 *         - dynamicId
 *         - staticId
 *         - name
 *         - type
 *     IBimObjectsItem:
 *       type: object
 *       properties:
 *         dynamicId:
 *           type: number
 *         staticId:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         children_relation_list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/IRelationListItem"
 *         parent_relation_list:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/IRelationListItem"
 *         externalId:
 *           type: string
 *         dbid:
 *           type: number
 *         bimFileId:
 *           type: string
 *         version:
 *           type: number
 *       required:
 *         - dynamicId
 *         - staticId
 *         - name
 *         - type
 *         - children_relation_list
 *         - parent_relation_list
 *         - externalId
 *         - dbid
 *         - bimFileId
 *         - version
 *     IRelationListItem:
 *       type: object
 *       properties:
 *         dynamicId:
 *           type: number
 *         staticId:
 *           type: string
 *         name:
 *           type: string
 *         children_number:
 *           type: number
 *       required:
 *         - dynamicId
 *         - staticId
 *         - name
 *         - children_number
 */
