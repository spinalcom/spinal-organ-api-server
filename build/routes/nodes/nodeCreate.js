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
const requestUtilities_1 = require("../../utilities/requestUtilities");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/node/create:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Create a node and return its information
     *     summary: Create a node
     *     tags:
     *       - Nodes
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateNode'
     *     responses:
     *       201:
     *         description: Node created successfully
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: Bad request
     */
    app.post('/api/v1/node/create', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const body = req.body;
            const { parentId, parentToChildRelationName, parentToChildRelationType, addInContext, contextId, ...createNodeInfo } = body;
            const node = spinal_env_viewer_graph_service_1.SpinalGraphService.createNode(createNodeInfo);
            const parent = await spinalAPIMiddleware.load(parentId, profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(parent);
            if (addInContext && contextId !== undefined) {
                const context = await spinalAPIMiddleware.load(contextId, profileId);
                await spinal_env_viewer_graph_service_1.SpinalGraphService.addChildInContext(parent.info.id.get(), node, context.info.id.get(), parentToChildRelationName, parentToChildRelationType);
            }
            else {
                await spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(parent.info.id.get(), node, parentToChildRelationName, parentToChildRelationType);
            }
            const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(node);
            let serverId = realNode._server_id;
            let count = 5;
            while (serverId === undefined && count >= 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
                serverId = realNode._server_id;
                count--;
            }
            const info = {
                dynamicId: realNode._server_id || -1,
                staticId: realNode.getId().get(),
                name: realNode.getName().get(),
                type: realNode.getType().get(),
            };
            return res.status(201).json(info);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json();
    });
};
//# sourceMappingURL=nodeCreate.js.map