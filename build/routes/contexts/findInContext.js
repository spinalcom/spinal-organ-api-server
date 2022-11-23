"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const findOneInContext_1 = require("../../utilities/findOneInContext");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/find_node_in_context:
     *   post:
     *     security:
     *       - OauthSecurity:
     *         - readOnly
     *     description: Find node object in a specific context
     *     summary: Gets Node
     *     tags:
     *      - Contexts/ontologies
     *     requestBody:
     *       description: (optionSearchNodes) this field takes a string that allows us to search either by dynamicId, the staticId or by name, (dynamicId), (staticId), (name) / (optionResult) this field takes a string that allows us to choose the type of result / either a standard result, or a detailed result by putting the type of the node.(standard) / (type of node (example = ticket)) (context) this field takes a string either the name of the context, the dynamicId or the staticId / (array) this field takes a list of strings according to your choice of fields (optionNodes from research)
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - optionSearchNodes
     *               - optionResult
     *               - context
     *               - array
     *             properties:
     *               optionSearchNodes:
     *                 type: string
     *               optionResult:
     *                 type: string
     *               context:
     *                 type: string
     *               array:
     *                 type: array
     *                 items:
     *                   type: string
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Node'
     *       400:
     *         description: Bad request
     */
    app.post('/api/v1/find_node_in_context', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var info;
            yield spinalAPIMiddleware.getGraph();
            const tab = req.body.array;
            const paramContext = req.body.context;
            var result = [];
            var context = yield verifyContext(paramContext);
            /**********************context************************/
            function verifyContext(paramContext) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (typeof spinal_core_connectorjs_type_1.FileSystem._objects[paramContext] !== 'undefined') {
                        return (context = yield spinalAPIMiddleware.load(parseInt(paramContext, 10), profileId));
                    }
                    else if (spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(paramContext)) {
                        return (context = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(paramContext));
                    }
                    else if (spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(paramContext)) {
                        return (context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(paramContext));
                    }
                    else {
                        res.status(400).send('context not exist');
                    }
                });
            }
            /***************** ***optionSearchNodes**************/
            if (req.body.optionSearchNodes === 'dynamicId') {
                let nodes = [];
                for (let index = 0; index < tab.length; index++) {
                    let node = yield spinalAPIMiddleware.load(parseInt(tab[index], 10), profileId);
                    nodes.push(node);
                }
                for (const _node of nodes) {
                    if (_node.belongsToContext(context)) {
                        if (req.body.optionResult === 'ticket') {
                            //Step
                            let _step = yield _node
                                .getParents('SpinalSystemServiceTicketHasTicket')
                                .then((steps) => {
                                for (const step of steps) {
                                    if (step.getType().get() ===
                                        'SpinalSystemServiceTicketTypeStep') {
                                        return step;
                                    }
                                }
                            });
                            let _process = yield _step
                                .getParents('SpinalSystemServiceTicketHasStep')
                                .then((processes) => {
                                for (const process of processes) {
                                    if (process.getType().get() === 'SpinalServiceTicketProcess') {
                                        return process;
                                    }
                                }
                            });
                            let elementSelected;
                            try {
                                if (_node.info.elementSelected !== undefined)
                                    elementSelected = yield spinalAPIMiddleware.loadPtr(_node.info.elementSelected);
                                else
                                    elementSelected = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(_node.info.nodeId.get());
                            }
                            catch (error) {
                                console.error(error);
                            }
                            info = {
                                dynamicId: _node._server_id,
                                staticId: _node.getId().get(),
                                name: _node.getName().get(),
                                type: _node.getType().get(),
                                priority: _node.info.priority.get(),
                                creationDate: _node.info.creationDate.get(),
                                elementSelected: elementSelected == undefined
                                    ? 0
                                    : {
                                        dynamicId: elementSelected._server_id,
                                        staticId: elementSelected.getId().get(),
                                        name: elementSelected.getName().get(),
                                        type: elementSelected.getType().get(),
                                    },
                                userName: _node.info.user == undefined
                                    ? ''
                                    : _node.info.user.name.get(),
                                gmaoId: _node.info.gmaoId == undefined ? '' : _node.info.gmaoId.get(),
                                gmaoDateCreation: _node.info.gmaoDateCreation == undefined
                                    ? ''
                                    : _node.info.gmaoDateCreation.get(),
                                description: _node.info.description == undefined
                                    ? ''
                                    : _node.info.description.get(),
                                declarer_id: _node.info.declarer_id == undefined
                                    ? ''
                                    : _node.info.declarer_id.get(),
                                process: {
                                    dynamicId: _process._server_id,
                                    staticId: _process.getId().get(),
                                    name: _process.getName().get(),
                                    type: _process.getType().get(),
                                },
                                step: {
                                    dynamicId: _step._server_id,
                                    staticId: _step.getId().get(),
                                    name: _step.getName().get(),
                                    type: _step.getType().get(),
                                    color: _step.info.color.get(),
                                    order: _step.info.order.get(),
                                },
                                workflowId: context._server_id,
                                workflowName: context.getName().get(),
                            };
                            result.push(info);
                        }
                        else {
                            info = {
                                dynamicId: _node._server_id,
                                staticId: _node.getId().get(),
                                name: _node.getName().get(),
                                type: _node.getType().get(),
                            };
                            result.push(info);
                        }
                    }
                    else
                        res.status(400).send('one of node not exist in this context');
                }
            }
            else if (req.body.optionSearchNodes === 'staticId') {
                let nodes = [];
                for (let index = 0; index < tab.length; index++) {
                    let node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(tab[index]);
                    if (typeof node === 'undefined') {
                        node = yield (0, findOneInContext_1.findOneInContext)(context, context, (n) => n.getId().get() === tab[index]);
                    }
                    nodes.push(node);
                }
                for (const _node of nodes) {
                    if (_node !== undefined) {
                        if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext &&
                            _node.belongsToContext(context)) {
                            if (req.body.optionResult === 'ticket') {
                                //Step
                                let _step = yield _node
                                    .getParents('SpinalSystemServiceTicketHasTicket')
                                    .then((steps) => {
                                    for (const step of steps) {
                                        if (step.getType().get() ===
                                            'SpinalSystemServiceTicketTypeStep') {
                                            return step;
                                        }
                                    }
                                });
                                let _process = yield _step
                                    .getParents('SpinalSystemServiceTicketHasStep')
                                    .then((processes) => {
                                    for (const process of processes) {
                                        if (process.getType().get() === 'SpinalServiceTicketProcess') {
                                            return process;
                                        }
                                    }
                                });
                                let elementSelected;
                                try {
                                    if (_node.info.elementSelected !== undefined)
                                        elementSelected = yield spinalAPIMiddleware.loadPtr(_node.info.elementSelected);
                                    else
                                        elementSelected = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode((_a = _node.info.nodeId) === null || _a === void 0 ? void 0 : _a.get());
                                }
                                catch (error) {
                                    console.error(error);
                                }
                                info = {
                                    dynamicId: _node._server_id,
                                    staticId: _node.getId().get(),
                                    name: _node.getName().get(),
                                    type: _node.getType().get(),
                                    priority: _node.info.priority.get(),
                                    creationDate: _node.info.creationDate.get(),
                                    elementSelected: elementSelected == undefined
                                        ? 0
                                        : {
                                            dynamicId: elementSelected._server_id,
                                            staticId: elementSelected.getId().get(),
                                            name: elementSelected.getName().get(),
                                            type: elementSelected.getType().get(),
                                        },
                                    userName: _node.info.user == undefined
                                        ? ''
                                        : _node.info.user.name.get(),
                                    gmaoId: _node.info.gmaoId == undefined ? '' : _node.info.gmaoId.get(),
                                    gmaoDateCreation: _node.info.gmaoDateCreation == undefined
                                        ? ''
                                        : _node.info.gmaoDateCreation.get(),
                                    description: _node.info.description == undefined
                                        ? ''
                                        : _node.info.description.get(),
                                    declarer_id: _node.info.declarer_id == undefined
                                        ? ''
                                        : _node.info.declarer_id.get(),
                                    process: {
                                        dynamicId: _process._server_id,
                                        staticId: _process.getId().get(),
                                        name: _process.getName().get(),
                                        type: _process.getType().get(),
                                    },
                                    step: {
                                        dynamicId: _step._server_id,
                                        staticId: _step.getId().get(),
                                        name: _step.getName().get(),
                                        type: _step.getType().get(),
                                        color: _step.info.color.get(),
                                        order: _step.info.order.get(),
                                    },
                                    workflowId: context._server_id,
                                    workflowName: context.getName().get(),
                                };
                                result.push(info);
                            }
                            else {
                                info = {
                                    dynamicId: _node._server_id,
                                    staticId: _node.getId().get(),
                                    name: _node.getName().get(),
                                    type: _node.getType().get(),
                                };
                                result.push(info);
                            }
                        }
                        else
                            res.status(400).send('one of node not exist in this context');
                    }
                }
            }
            else if (req.body.optionSearchNodes === 'name') {
                if (context) {
                    let res = yield spinal_env_viewer_graph_service_1.SpinalGraphService.findInContext(context.getId().get(), context.getId().get());
                    for (const _node of res) {
                        for (const _name of tab) {
                            if (_node.name.get() === _name) {
                                let node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(_node.id.get());
                                if (typeof node === 'undefined') {
                                    node = yield (0, findOneInContext_1.findOneInContext)(context, context, (n) => n.getId().get() === _node.id.get());
                                }
                                if (req.body.optionResult === 'ticket') {
                                    //Step
                                    let _step = yield node
                                        .getParents('SpinalSystemServiceTicketHasTicket')
                                        .then((steps) => {
                                        for (const step of steps) {
                                            if (step.getType().get() ===
                                                'SpinalSystemServiceTicketTypeStep') {
                                                return step;
                                            }
                                        }
                                    });
                                    let _process = yield _step
                                        .getParents('SpinalSystemServiceTicketHasStep')
                                        .then((processes) => {
                                        for (const process of processes) {
                                            if (process.getType().get() ===
                                                'SpinalServiceTicketProcess') {
                                                return process;
                                            }
                                        }
                                    });
                                    let elementSelected;
                                    try {
                                        if (node.info.elementSelected !== undefined)
                                            elementSelected = yield spinalAPIMiddleware.loadPtr(node.info.elementSelected);
                                        else
                                            elementSelected = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(node.info.nodeId.get());
                                    }
                                    catch (error) {
                                        console.error(error);
                                    }
                                    info = {
                                        dynamicId: _node._server_id,
                                        staticId: _node.getId().get(),
                                        name: _node.getName().get(),
                                        type: _node.getType().get(),
                                        priority: _node.info.priority.get(),
                                        creationDate: _node.info.creationDate.get(),
                                        elementSelected: elementSelected == undefined
                                            ? 0
                                            : {
                                                dynamicId: elementSelected._server_id,
                                                staticId: elementSelected.getId().get(),
                                                name: elementSelected.getName().get(),
                                                type: elementSelected.getType().get(),
                                            },
                                        userName: _node.info.user == undefined
                                            ? ''
                                            : _node.info.user.name.get(),
                                        gmaoId: _node.info.gmaoId == undefined
                                            ? ''
                                            : _node.info.gmaoId.get(),
                                        gmaoDateCreation: _node.info.gmaoDateCreation == undefined
                                            ? ''
                                            : _node.info.gmaoDateCreation.get(),
                                        description: _node.info.description == undefined
                                            ? ''
                                            : _node.info.description.get(),
                                        declarer_id: _node.info.declarer_id == undefined
                                            ? ''
                                            : _node.info.declarer_id.get(),
                                        process: {
                                            dynamicId: _process._server_id,
                                            staticId: _process.getId().get(),
                                            name: _process.getName().get(),
                                            type: _process.getType().get(),
                                        },
                                        step: {
                                            dynamicId: _step._server_id,
                                            staticId: _step.getId().get(),
                                            name: _step.getName().get(),
                                            type: _step.getType().get(),
                                            color: _step.info.color.get(),
                                            order: _step.info.order.get(),
                                        },
                                        workflowId: context._server_id,
                                        workflowName: context.getName().get(),
                                    };
                                    result.push(info);
                                }
                                else {
                                    info = {
                                        dynamicId: node._server_id,
                                        staticId: node.getId().get(),
                                        name: node.getName().get(),
                                        type: node.getType().get(),
                                    };
                                    result.push(info);
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('ko');
        }
        res.json(result);
    }));
};
//# sourceMappingURL=findInContext.js.map