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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/endPointsGroup/{contextId}/category/{categoryId}/group/{groupId}/endpointList:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: read  endpointList
     *     summary: Get  endpointList
     *     tags:
     *       - EndPoints Group
     *     parameters:
     *      - in: path
     *        name: contextId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: categoryId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *      - in: path
     *        name: groupId
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/BasicNode'
     *       400:
     *         description: Bad request
     */
    app.get('/api/v1/endPointsGroup/:contextId/category/:categoryId/group/:groupId/endpointList', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const _endpointList = [];
            const context = await spinalAPIMiddleware.load(parseInt(req.params.contextId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            const category = await spinalAPIMiddleware.load(parseInt(req.params.categoryId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(category);
            const group = await spinalAPIMiddleware.load(parseInt(req.params.groupId, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(group);
            if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext &&
                category.belongsToContext(context) &&
                group.belongsToContext(context)) {
                if (context.getType().get() === 'BmsEndpointGroupContext') {
                    const endpointList = await group.getChildren('groupHasBmsEndpoint');
                    for (const endpoint of endpointList) {
                        const info = {
                            dynamicId: endpoint._server_id,
                            staticId: endpoint.getId().get(),
                            name: endpoint.getName().get(),
                            type: endpoint.getType().get(),
                        };
                        _endpointList.push(info);
                    }
                }
                else {
                    res
                        .status(400)
                        .send('node is not type of BmsEndpointGroupContext ');
                }
            }
            else {
                res.status(400).send('category or group not found in context');
            }
            res.status(200).json(_endpointList);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('ko');
        }
    });
};
//# sourceMappingURL=endpointList.js.map