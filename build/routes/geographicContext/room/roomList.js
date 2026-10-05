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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/floor/{id}/room_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the rooms of a floor
     *     description: >-
     *       Returns the rooms attached to a floor through `hasGeographicRoom`, each with its attribute
     *       categories and the attributes they hold.
     *
     *
     *       The floor node is not type-checked here : calling this on another node simply returns the
     *       children it has under that relation, usually an empty array.
     *     tags:
     *      - Geographic Context
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the floor.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The rooms of the floor, with their attribute categories.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Room'
     *       400:
     *         description: The floor could not be loaded, or its rooms could not be read.
     *       401:
     *         description: The profile is not allowed to read this floor.
     */
    app.get('/api/v1/floor/:id/room_list', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const floor = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(floor);
            const rooms = await floor.getChildren('hasGeographicRoom');
            const nodes = await Promise.all(rooms.map(async (room) => {
                const categories = await getSpinalCategoriesAndAttributes(room);
                return {
                    dynamicId: room._server_id,
                    staticId: room.getId().get(),
                    name: room.getName().get(),
                    type: room.getType().get(),
                    categories,
                };
            }));
            return res.status(200).send(nodes);
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res
                .status(400)
                .send('An error occurred while retrieving the room list and their attributes.');
        }
    });
};
async function getSpinalCategoriesAndAttributes(node) {
    const categories = await node.getChildren(spinal_env_viewer_plugin_documentation_service_1.NODE_TO_CATEGORY_RELATION);
    return Promise.all(categories.map(async (category) => {
        const attributes = (await category.element.load()).get();
        return {
            dynamicId: category._server_id,
            staticId: category.getId().get(),
            name: category.getName().get(),
            type: category.getType().get(),
            attributs: attributes,
        };
    }));
}
//# sourceMappingURL=roomList.js.map