"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_task_service_1 = require("spinal-env-viewer-task-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/eventContext/list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Return list of event contexts
     *     summary: Gets a list of event contexts
     *     tags:
     *      - Calendar & Event
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/ContextEvent'
     *       400:
     *         description: Bad request
     */
    app.get('/api/v1/eventContext/list', async (req, res, next) => {
        try {
            const nodes = [];
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const userGraph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const contexts = userGraph ? await userGraph.getChildren("hasContext") : [];
            const listContextEvents = contexts.filter(context => context.getType().get() === spinal_env_viewer_task_service_1.CONTEXT_TYPE);
            for (const _child of listContextEvents) {
                // @ts-ignore
                // const _child = SpinalGraphService.getRealNode(child.id.get())
                if (_child.getType().get() === spinal_env_viewer_task_service_1.CONTEXT_TYPE) {
                    const info = {
                        dynamicId: _child._server_id,
                        staticId: _child.getId().get(),
                        name: _child.getName().get(),
                        type: _child.getType().get(),
                    };
                    nodes.push(info);
                }
            }
            res.send(nodes);
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of contexts events is not loaded");
        }
    });
};
//# sourceMappingURL=listEventContext.js.map