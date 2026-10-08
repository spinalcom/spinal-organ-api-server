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
     *     summary: List the event contexts
     *     description: >-
     *       Returns every context of type `SpinalEventGroupContext` the profile can reach - the calendars
     *       of the twin. Events are organised as context -> category -> group -> event.
     *     tags:
     *       - Calendar & Event
     *     responses:
     *       200:
     *         description: The event contexts (an empty array if there are none).
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/ContextEvent'
     *       400:
     *         description: The profile graph could not be read ("list of contexts events is not loaded").
     *       401:
     *         description: The profile is not allowed to read the graph.
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