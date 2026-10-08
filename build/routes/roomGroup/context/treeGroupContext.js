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
const recTree_1 = require("../../../utilities/recTree");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/roomsGroup/{id}/tree:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get the whole tree of a group context
     *     description: >-
     *       Returns a group context with everything below it : its categories, their groups, and the
     *       items assigned to each group. On a large context this response can be big - walk it level by
     *       level with the `category_list` and `group_list` routes when you can.
     *     tags:
     *       - Rooms Group
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Dynamic ID of the group context.
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     responses:
     *       200:
     *         description: The context and its descendants.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/ContextTree'
     *       400:
     *         description: The context could not be loaded.
     *       401:
     *         description: The profile is not allowed to read this context.
     *       500:
     *         description: The tree could not be built.
     */
    app.get("/api/v1/roomsGroup/:id/tree", async (req, res, next) => {
        let contexts;
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const context = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            if (context.getType().get() === "geographicRoomGroupContext") {
                if (context instanceof spinal_env_viewer_graph_service_1.SpinalContext) {
                    contexts = {
                        dynamicId: context._server_id,
                        staticId: context.getId().get(),
                        name: context.getName().get(),
                        type: context.getType().get(),
                        context: (context instanceof spinal_env_viewer_graph_service_1.SpinalContext ? "SpinalContext" : ""),
                        children: await (0, recTree_1.recTree)(context, context)
                    };
                }
            }
            else {
                res.status(400).send("node is not type of geographicRoomGroupContext ");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message);
        }
        res.json(contexts);
    });
};
//# sourceMappingURL=treeGroupContext.js.map