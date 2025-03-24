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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
// // import spinalAPIMiddleware from '../../spinalAPIMiddleware';
const BIM_FILE_CONTEXT_NAME = 'BimFileContext';
const BIM_FILE_CONTEXT_RELATION = 'hasBimFile';
const BIM_FILE_RELATION = 'hasBimContext';
const BIM_CONTEXT_RELATION = 'hasBimObject';
module.exports = (_a = class BimObjectUtils {
        constructor() {
            this.context = null;
        }
        static getInstance(spinalAPIMiddleware) {
            this.spinalAPIMiddleware = spinalAPIMiddleware;
            return typeof _a.instance !== 'undefined'
                ? _a.instance
                : (_a.instance = new _a());
        }
        getContext() {
            if (this.context)
                return this.context;
            this.context = new Promise(async (resolve) => {
                const graph = await _a.spinalAPIMiddleware.getGraph();
                resolve(graph.getContext(BIM_FILE_CONTEXT_NAME));
            });
            return this.context;
        }
        async getBimFile(bimFileId) {
            const context = await this.getContext();
            const bimFiles = await context.getChildren([
                BIM_FILE_CONTEXT_RELATION,
            ]);
            for (const bimFile of bimFiles) {
                if (bimFile._server_id === bimFileId ||
                    bimFile.getId().get() === bimFileId) {
                    return bimFile;
                }
            }
            return undefined;
        }
        async getBimObjects(bimFileNode, dbIds) {
            const res = [];
            const bimContexts = await bimFileNode.getChildren([BIM_FILE_RELATION]);
            for (const bimContext of bimContexts) {
                // eslint-disable-next-line no-await-in-loop
                const bimObjects = await bimContext.getChildren([BIM_CONTEXT_RELATION]);
                bimObjects.reduce((acc, bimObject) => {
                    if (dbIds.includes(bimObject.info.dbid.get()))
                        acc.push(bimObject);
                    return acc;
                }, res);
            }
            return res;
        }
        async getBimObjectsNodeInfo(bimObjects) {
            const result = [];
            for (const node of bimObjects) {
                const childrens_list = this.childrensNode(node);
                // eslint-disable-next-line no-await-in-loop
                const parents_list = await this.parentsNode(node);
                const data = {
                    dynamicId: node._server_id,
                    staticId: node.getId().get(),
                    name: node.getName().get(),
                    type: node.getType().get(),
                    children_relation_list: childrens_list,
                    parent_relation_list: parents_list,
                };
                this.copyAttrInObj(data, node, 'externalId');
                this.copyAttrInObj(data, node, 'dbid');
                this.copyAttrInObj(data, node, 'bimFileId');
                this.copyAttrInObj(data, node, 'version');
                result.push(data);
            }
            return result;
        }
        async getBimObjectsInfo(bimFileId, dbids) {
            const bimFileNode = await this.getBimFile(bimFileId);
            if (!bimFileNode)
                return {
                    model: {
                        name: 'BimFileId not found',
                        staticId: typeof bimFileId === 'string' ? bimFileId : 'undefined',
                        type: 'undefined',
                        dynamicId: typeof bimFileId === 'number' ? bimFileId : NaN,
                    },
                    bimObjects: [],
                    notFound: dbids,
                };
            try {
                const bimObjects = await this.getBimObjects(bimFileNode, dbids);
                const bimObjectsInfo = await this.getBimObjectsNodeInfo(bimObjects);
                const model = {
                    dynamicId: bimFileNode._server_id,
                    staticId: bimFileNode.getId().get(),
                    name: bimFileNode.getName().get(),
                    type: bimFileNode.getType().get(),
                };
                const notFound = dbids.reduce((acc, dbid) => {
                    for (const bimObject of bimObjects) {
                        if (typeof bimObject.info.dbid !== 'undefined' &&
                            bimObject.info.dbid.get() === dbid) {
                            return acc;
                        }
                    }
                    acc.push(dbid);
                    return acc;
                }, []);
                return {
                    model,
                    bimObjects: bimObjectsInfo,
                    notFound,
                };
            }
            catch (e) {
                console.error(e);
                throw 'Internal server error';
            }
        }
        copyAttrInObj(target, node, string) {
            if (typeof node.info[string] !== 'undefined') {
                Object.assign(target, { [string]: node.info[string].get() });
            }
        }
        childrensNode(node) {
            const childs = node.children;
            const res = [];
            // childrens relation course
            for (const [, relationTypeMap] of childs) {
                for (const [, relation] of relationTypeMap) {
                    const child = {
                        dynamicId: relation._server_id,
                        staticId: relation.getId().get(),
                        name: relation.getName().get(),
                        children_number: relation.getNbChildren(),
                    };
                    res.push(child);
                }
            }
            return res;
        }
        async parentsNode(node) {
            const parents = node.parents;
            const auxtab = [];
            let res = [];
            for (const [, ptrList] of parents) {
                for (let i = 0; i < ptrList.length; i++) {
                    auxtab.push(ptrList[i].load());
                }
            }
            res = await Promise.all(auxtab).then((values) => {
                return values.map((node) => {
                    return {
                        dynamicId: node._server_id,
                        staticId: node.getId().get(),
                        name: node.getName().get(),
                        children_number: node.getNbChildren(),
                    };
                });
            });
            return res;
        }
    },
    _a.instance = undefined,
    _a);
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
//# sourceMappingURL=BimObjectUtils.js.map