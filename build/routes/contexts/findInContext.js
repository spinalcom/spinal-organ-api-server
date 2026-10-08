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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const findOneInContext_1 = require("../../utilities/findOneInContext");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const requestUtilities_1 = require("../../utilities/requestUtilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/find_node_in_context:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Look up several nodes inside one context
     *     description: >-
     *       Resolves a batch of nodes inside a single context. `array` holds the values to look up and
     *       `optionSearchNodes` says how to read them (`dynamicId`, `staticId` or `name`); every
     *       resolved node must belong to the context, otherwise its entry fails.
     *
     *
     *       The lookups are independent : each value is resolved on its own and a failure only affects
     *       its own entry. The response is always an array in the same order as `array`; a failed entry
     *       is replaced by an object holding the searched value and an `error` message, and the whole
     *       response is then returned with **206 Partial Content** instead of 200.
     *
     *
     *       Searching by `name` walks the context until a node with that name is found, so it is much
     *       slower than `dynamicId` / `staticId` and returns the first match only.
     *     tags:
     *      - Contexts/ontologies
     *     requestBody:
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
     *                 description: How the values of `array` are interpreted.
     *                 enum: [dynamicId, staticId, name]
     *               optionResult:
     *                 type: string
     *                 description: >-
     *                   Shape of each result. `ticket` returns the full ticket details (priority,
     *                   creation date, declarer, process, step, workflow, categories and the selected
     *                   element); any other value returns the standard node summary
     *                   (dynamicId, staticId, name, type).
     *                 example: standard
     *               context:
     *                 type: string
     *                 description: >-
     *                   The context to search in, given as a dynamic ID, a static ID or a context name.
     *               array:
     *                 type: array
     *                 description: The values to look up, read according to `optionSearchNodes`.
     *                 items:
     *                   type: string
     *     responses:
     *       200:
     *         description: Every node was resolved.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Node'
     *       206:
     *         description: >-
     *           At least one node could not be resolved. The array holds the successful results and, in
     *           place of each failure, an object with the searched value and an `error` message.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *       400:
     *         description: The context could not be resolved, or the request body is malformed.
     *       401:
     *         description: The profile is not allowed to read the context.
     */
    app.post('/api/v1/find_node_in_context', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            await spinalAPIMiddleware.getGraph();
            const tab = req.body.array;
            const paramContext = req.body.context;
            const ticketResult = req.body.optionResult === 'ticket';
            const context = await verifyContext(paramContext, spinalAPIMiddleware, profileId);
            const promises = tab.map((searchValue) => getNodeInformation(context, req.body.optionSearchNodes, searchValue, ticketResult, spinalAPIMiddleware, profileId));
            const settledResults = await Promise.allSettled(promises);
            const finalResults = settledResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                else {
                    console.error(`Error with node id ${tab[index]}: ${result.reason}`);
                    const errorObject = {};
                    errorObject[req.body.optionSearchNodes] = tab[index];
                    errorObject['error'] =
                        result.reason?.message ||
                            result.reason ||
                            'Failed to get Node Details';
                    return errorObject;
                }
            });
            const isGotError = settledResults.some((result) => result.status === 'rejected');
            if (isGotError)
                return res.status(206).json(finalResults);
            return res.status(200).json(finalResults);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('ko');
        }
    });
};
async function verifyContext(paramContext, spinalAPIMiddleware, profileId) {
    if (typeof spinal_core_connectorjs_type_1.FileSystem._objects[paramContext] !== 'undefined') {
        return await spinalAPIMiddleware.load(parseInt(paramContext, 10), profileId);
    }
    else if (spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(paramContext)) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(paramContext);
    }
    else if (spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(paramContext)) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(paramContext);
    }
    else {
        throw {
            code: 400,
            message: `Context ${paramContext} not found`,
        };
    }
}
async function getTicketInfo(context, _node, spinalAPIMiddleware) {
    const _step = await _node
        .getParents('SpinalSystemServiceTicketHasTicket')
        .then((steps) => {
        for (const step of steps) {
            if (step.getType().get() === 'SpinalSystemServiceTicketTypeStep') {
                return step;
            }
        }
    });
    const _process = await _step
        .getParents('SpinalSystemServiceTicketHasStep')
        .then((processes) => {
        for (const process of processes) {
            if (process.getType().get() === 'SpinalServiceTicketProcess') {
                return process;
            }
        }
    });
    const categories = await _node.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION);
    const promise_infoCategories = categories.map(async (categorie) => {
        const attributes = await categorie.element.load();
        const infoCategories = {
            dynamicId: categorie._server_id,
            staticId: categorie.getId().get(),
            name: categorie.getName().get(),
            type: categorie.getType().get(),
            attributs: attributes.get(),
        };
        return infoCategories;
    });
    const _infoCategories = await Promise.all(promise_infoCategories);
    let elementSelected;
    try {
        if (_node.info.elementSelected !== undefined)
            elementSelected = await spinalAPIMiddleware.loadPtr(_node.info.elementSelected);
        else
            elementSelected = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(_node.info.nodeId?.get());
    }
    catch (error) {
        console.error(error);
    }
    return {
        dynamicId: _node._server_id,
        staticId: _node.getId().get(),
        name: _node.getName().get(),
        type: _node.getType().get(),
        priority: _node.info.priority?.get() || '',
        creationDate: _node.info.creationDate?.get() || '',
        elementSelected: elementSelected == undefined
            ? 0
            : {
                dynamicId: elementSelected._server_id,
                staticId: elementSelected.getId().get(),
                name: elementSelected.getName().get(),
                type: elementSelected.getType().get(),
            },
        userName: _node.info.user?.name?.get() || _node.info.user?.username?.get() || '',
        gmaoId: _node.info.gmaoId?.get() || '',
        gmaoDateCreation: _node.info.gmaoDateCreation?.get() || '',
        description: _node.info.description?.get() || '',
        declarer_id: _node.info.declarer_id?.get() || '',
        process: _process === undefined
            ? ''
            : {
                dynamicId: _process._server_id,
                staticId: _process.getId().get(),
                name: _process.getName().get(),
                type: _process.getType().get(),
            },
        step: _step === undefined
            ? ''
            : {
                dynamicId: _step._server_id,
                staticId: _step.getId().get(),
                name: _step.getName().get(),
                type: _step.getType().get(),
                color: _step.info.color?.get(),
                order: _step.info.order?.get(),
            },
        workflowId: context._server_id,
        workflowName: context.getName().get(),
        categories: _infoCategories,
    };
}
async function getNodeWithSearchOption(context, searchOption, searchValue, spinalAPIMiddleware, profileId) {
    let node;
    if (searchOption === 'dynamicId') {
        node = await spinalAPIMiddleware.load(parseInt(searchValue, 10), profileId);
    }
    if (searchOption === 'staticId') {
        node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(searchValue);
        if (typeof node === 'undefined') {
            node = await (0, findOneInContext_1.findOneInContext)(context, context, (n) => n.getId().get() === searchValue);
        }
    }
    if (searchOption === 'name') {
        node = await (0, findOneInContext_1.findOneInContext)(context, context, (n) => n.getName().get() === searchValue &&
            n.getId().get() !== context.getId().get());
    }
    return node;
}
async function getNodeInformation(context, searchOption, searchValue, ticketResult = false, spinalAPIMiddleware, profileId) {
    const node = await getNodeWithSearchOption(context, searchOption, searchValue, spinalAPIMiddleware, profileId);
    if (!node) {
        throw {
            code: 400,
            message: `Node ${searchValue} could not be found`,
        };
    }
    if (!node.belongsToContext(context)) {
        throw {
            code: 400,
            message: `Node ${node.getId().get()} does not belong to context ${context
                .getId()
                .get()}`,
        };
    }
    if (ticketResult) {
        return await getTicketInfo(context, node, spinalAPIMiddleware);
    }
    else {
        return {
            dynamicId: node._server_id,
            staticId: node.getId().get(),
            name: node.getName().get(),
            type: node.getType().get(),
        };
    }
}
//# sourceMappingURL=findInContext.js.map