/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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
import { spinalEventEmitter } from "spinal-env-viewer-plugin-event-emitter";
import { ADD_CHILD_EVENT, ADD_CHILD_IN_CONTEXT_EVENT, REMOVE_CHILD_EVENT, REMOVE_CHILDREN_EVENT, SpinalGraph } from 'spinal-model-graph';
import { SpinalGraphService, SpinalNode, SpinalContext } from 'spinal-env-viewer-graph-service';
import { FileSystem, Model } from 'spinal-core-connectorjs_type';
import { SpinalTimeSeries } from "spinal-model-timeseries";
import * as lodash from "lodash";
import { Server } from "socket.io";
import { OK_STATUS, EVENT_NAMES, IAction, IScope, ISubscribeOptions } from './lib'
import { spinalAPIMiddlewareInstance } from "./spinalAPIMiddleware";



const relationToExclude = [SpinalTimeSeries.relationName]
// export enum bindType {
//     all,
//     inContextOnly,
//     notInContext
// }

class SpinalGraphUtils {
    public spinalConnection;
    private nodeBinded: Map<string, { bindTypes: { [key: string]: string }, events: { [key: string]: string } }> = new Map();
    private io: Server;

    constructor() {
        this._listenAddChildEvent();
        this._listenAddChildInContextEvent();
        this._listenRemoveChildEvent();
        this._listenAddChildrenEvent();
    }


    public async init(conn: any): Promise<any> {
        this.spinalConnection = conn;

    }

    public setIo(io: Server) {
        this.io = io;
    }

    public getProfileGraph(profileId: string): SpinalGraph<any> {
        return spinalAPIMiddlewareInstance.getGraph(profileId);
    }

    // public async getNode(nodeId: string | number, contextId?: string | number): Promise<SpinalNode<any>> {
    //     //@ts-ignore
    //     if (!isNaN(nodeId)) {
    //         const node = await this.getNodeWithServerId(<number>nodeId);
    //         //@ts-ignore
    //         if (node && node instanceof SpinalNode) SpinalGraphService._addNode(node);

    //         return node;
    //     }

    //     return this.getNodeWithStaticId(nodeId.toString(), contextId);
    // }

    public async getNode(nodeId: string, contextId?: string, profileId?: string): Promise<SpinalNode<any>> {
        //@ts-ignore
        if (!isNaN(nodeId)) {
            const server_id = parseInt(nodeId);
            return spinalAPIMiddlewareInstance.load(server_id, profileId);
        }

        return this.getNodeWithStaticId(nodeId.toString(), contextId, profileId);
    }

    // public getNodeWithServerId(server_id: number): Promise<any> {
    //     return new Promise((resolve) => {
    //         if (typeof FileSystem._objects[server_id] !== "undefined") {
    //             return resolve(FileSystem._objects[server_id]);
    //         }
    //         this.spinalConnection.load_ptr(server_id, (node) => {
    //             resolve(node);
    //         })
    //     });
    // }

    public async getNodeWithStaticId(nodeId: string, contextId?: string, profileId?: string): Promise<SpinalNode<any>> {
        return spinalAPIMiddlewareInstance.getNodeWithStaticId(nodeId, contextId, profileId)
    }

    public async bindNode(node: SpinalNode<any>, context: SpinalContext<any>, options: ISubscribeOptions, eventName?: string): Promise<void> {

        try {
            // const model = new Model({ info, element });
            const _eventName = eventName || node.getId().get();

            await this._bindInfoAndElement(_eventName, node, options);

            // model.bind(lodash.debounce(() => callback(null, _eventName, this._formatNode(model.get())), 1000), false);

            if (options.subscribeChildren) {
                switch (options.subscribeChildScope) {
                    case IScope.in_context:
                        this._bindChildInContext(node, context);
                        break;
                    case IScope.tree_in_context:
                        this.bindContextTree(node, context);
                        break;
                    case IScope.not_in_context:
                        this.bindChildNotInContext(node);
                        break;
                    case IScope.all:
                        this._bindAllChild(node);
                }
            }
        } catch (error) {
            console.error(error);

            const err_message = error.message;
            console.error(err_message);

        }
    }

    public bindContextTree(startNode: SpinalNode<any>, context: SpinalContext<any>): void {
        const eventName = `${context.getId().get()}:${startNode.getId().get()}`;
        startNode.findInContext(context, (node) => {
            this._activeEventSender(node);
            this.bindNode(node, context, {}, eventName);
            return false;
        })
    }

    public async bindChildNotInContext(node: SpinalNode<any>): Promise<void> {
        this._activeEventSender(node);
        const eventName = node.getId().get();
        const relations = this._getRelationNameNotInContext(node);
        const children = await node.getChildren(relations.filter(el => relationToExclude.indexOf(el) !== -1));

        children.forEach((child) => this.bindNode(child, null, {}, eventName));
    }

    public profileHasAccess(profileId: string, context: SpinalContext<any>, node?: SpinalNode<any>): boolean | Error {
        const graph = this.getProfileGraph(profileId);
        if (!graph) return new Error(`no graph found for ${profileId}`);

        const contextIds = graph.getChildrenIds();
        const contextFound = contextIds.find(id => id === context.getId().get());
        if (!contextFound) return new Error(`Unauthorized: You have not access to ${context.getName().get()}`);

        if (node && !node.belongsToContext(context)) return new Error(`Unauthorized: You have not access to ${node.getName().get()}`)

        return true;
    }



    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                      PRIVATE                                                          //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    private async _bindAllChild(node: SpinalNode<any>): Promise<void> {
        this._activeEventSender(node);
        const eventName = node.getId().get();
        const relationNames = this._getRelationNames(node);
        const children = await node.getChildren(relationNames.filter(el => relationToExclude.indexOf(el) !== -1));

        children.forEach((child) => this.bindNode(child, null, {}, eventName));
    }

    private async _bindChildInContext(node: SpinalNode<any>, context: SpinalContext<any>): Promise<void> {
        this._activeEventSender(node);
        const eventName = `${context.getId().get()}:${node.getId().get()}`;
        const children = await node.getChildrenInContext(context);
        children.forEach((child) => this.bindNode(child, context, {}, eventName));
    }

    private _getRelationNameNotInContext(node: SpinalNode<any>): string[] {
        const relationKeys = node.children.keys();
        const t = relationKeys.map(key => {
            const relationsMap = node.children[key];
            const relationNames = relationsMap.keys();
            return relationNames.filter(relationName => {
                const contextIds = relationsMap[relationName].contextIds.keys();
                return !contextIds || contextIds.length === 0;
            })
        })

        return lodash.flattenDeep(t);
    }

    private _getRelationNames(node: SpinalNode<any>) {
        const relationKeys = node.children.keys();
        const t = relationKeys.map(key => {
            const relationsMap = node.children[key];
            return relationsMap.keys();

        })

        return lodash.flattenDeep(t);
    }

    private async _bindInfoAndElement(eventName: string, node: SpinalNode<any>, options: ISubscribeOptions = {}) {
        const nodeId = node.getId().get();
        this._addNodeToBindedNode(nodeId, eventName, options);
        let info = node.info;
        let element = await node.getElement(true);

        const model = new Model({ info, element });
        model.bind(lodash.debounce(() => this._sendSocketEvent(node, model.get(), eventName), 1000), false);
        // model.bind(lodash.debounce(() => callback(null, eventName, this._formatNode(model.get())), 1000), false);

    }

    private _addNodeToBindedNode(nodeId: string, eventName: string, options: ISubscribeOptions) {
        const value = this.nodeBinded.get(nodeId) || { events: {}, bindTypes: {} };
        value.events[eventName] = eventName;

        if (options.subscribeChildren) {
            const key = options.subscribeChildScope;
            if (!!key) value.bindTypes[key] = key;
        }

        this.nodeBinded.set(nodeId, value);
    }

    private async _formatNode(node: SpinalNode<any>, model?: { info: { [key: string]: any }, element: { [key: string]: any } }): Promise<any> {
        if (model) {
            return {
                info: model.info,
                element: model.element
            }
        }
        const info = node.info;
        const element = await node.getElement(true);
        return { info: info.get(), element: element && element.get() }
    }

    private async _sendSocketEvent(node: SpinalNode<any>, model: { info: { [key: string]: any }, element: { [key: string]: any } }, eventName: string, action?: IAction) {
        const status = OK_STATUS;
        const data = { event: action || { name: EVENT_NAMES.updated, nodeId: node.getId().get() }, node: await this._formatNode(node, model) };

        console.log("send", data, "data");

        this.io.to(eventName).emit(eventName, { data, status });
    }

    private _listenAddChildEvent() {
        spinalEventEmitter.on(ADD_CHILD_EVENT, async ({ nodeId, childId }) => {
            const node = await this._callbackListen(nodeId, childId, undefined, nodeId, [IScope.all, IScope.not_in_context]);
            if (node instanceof SpinalNode) {
                let action = { name: EVENT_NAMES.addChild, parentId: nodeId, nodeId: childId }
                this._sendSocketEvent(node, undefined, nodeId, action);
            }
        })
    }

    private _listenAddChildInContextEvent() {
        spinalEventEmitter.on(ADD_CHILD_IN_CONTEXT_EVENT, async ({ nodeId, childId, contextId }) => {
            const node = await this._callbackListen(nodeId, childId, contextId, nodeId, [IScope.all, IScope.not_in_context]);
            if (node instanceof SpinalNode) {
                const eventName = `${contextId}:${nodeId}`;
                let action = { name: EVENT_NAMES.addChildInContext, parentId: nodeId, nodeId: childId, contextId }
                this._sendSocketEvent(node, undefined, eventName, action);
            }
        })
    }

    private _listenRemoveChildEvent() {
        spinalEventEmitter.on(REMOVE_CHILD_EVENT, ({ nodeId, childId }) => {
            const data = this.nodeBinded.get(nodeId);
            if (data) {
                const node = SpinalGraphService.getRealNode(nodeId);
                const event = nodeId
                const action = { name: EVENT_NAMES.childRemoved, parentId: nodeId, nodeId: childId };
                this._sendSocketEvent(node, undefined, event, action)
            }
        })
    }

    private _listenAddChildrenEvent() {
        spinalEventEmitter.on(REMOVE_CHILDREN_EVENT, ({ nodeId, childrenIds }) => {
            const data = this.nodeBinded.get(nodeId);
            if (data) {
                const node = SpinalGraphService.getRealNode(nodeId);
                const event = nodeId
                const action = { name: EVENT_NAMES.childrenRemoved, parentId: nodeId, nodeIds: childrenIds };
                this._sendSocketEvent(node, undefined, event, action);
            }
        })
    }

    private _activeEventSender(node: SpinalNode<any>) {
        if (node.info.activeEventSender) node.info.activeEventSender.set(true);
        else node.info.add_attr({ activeEventSender: true });
    }


    private async _findNode(childId: string, parentId: string): Promise<SpinalNode<any>> {
        let node = SpinalGraphService.getRealNode(childId);
        if (!node && parentId) {
            const parentNode = SpinalGraphService.getRealNode(parentId);
            if (parentNode) {
                const children = await parentNode.getChildren();
                node = children.find(el => el.getId().get() === childId);
            }
        }

        return node;
    }

    private async _callbackListen(nodeId: string, childId: string, contextId: string, eventName: string, bindTypes: string[]): Promise<SpinalNode<any>> {
        const data = this.nodeBinded.get(nodeId);
        let binded = false;
        if (data) {
            const _bindTypes = data.bindTypes;
            const found = bindTypes.find(el => _bindTypes[el]);

            if (found) {
                const node = await this._findNode(nodeId, childId);
                if (node instanceof SpinalNode) {
                    const context = contextId ? SpinalGraphService.getRealNode(contextId) : undefined;
                    this.bindNode(node, context, {}, eventName);
                    return node;
                }
            }
        }
    }




    // private _getAndFormatData(info: spinal.Model, element: spinal.Model, eventName: string, actionName: string, attribute: string, callback: Function) {
    //     const _info = info.get();
    //     const _element = (element && element.get()) || {};
    //     const action = { name: actionName, nodeId: _info.id, attribute };

    //     const data = { info: _info, element: _element, action };
    //     callback(null, eventName, data);
    // }



    // private async _formatNode(node: SpinalNode<any>): Promise<{ info: spinal.Model; element: spinal.Model }> {
    //     const info = node.info;
    //     const element = await node.getElement(true);

    //     return {
    //         info: info && info.get(),
    //         element: element && element.get()
    //     }
    // }
}

export const spinalGraphUtils = new SpinalGraphUtils();