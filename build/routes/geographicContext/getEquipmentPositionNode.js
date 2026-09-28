"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../utilities/requestUtilities");
const getPosition_1 = require("../../utilities/getPosition");
const getSpatialContext_1 = require("../../utilities/getSpatialContext");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/equipement/{id}/get_postion:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get the position of an equipment (deprecated alias)
     *     description: >-
     *       Kept for backwards compatibility : both the path and the word `get_postion` carry historical
     *       typos. Identical result to `/api/v1/equipment/{id}/get_position`, which should be used
     *       instead.
     *     deprecated: true
     *     tags:
     *       - Geographic Context
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the equipment.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The equipment with its room, floor, building and context.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Position'
     *       400:
     *         description: The spatial context is missing, or the equipment could not be located.
     *       401:
     *         description: The profile is not allowed to read this equipment.
     */
    // Deprecated typo error
    app.get("/api/v1/equipement/:id/get_postion", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const spatialContextId = (await (0, getSpatialContext_1.getSpatialContext)(spinalAPIMiddleware, profileId)).getId().get();
            const position = await (0, getPosition_1.getEquipmentPosition)(spinalAPIMiddleware, profileId, spatialContextId, parseInt(req.params.id, 10));
            res.json(position);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send(error.message || "Failed to get position");
        }
    });
    /**
     * @swagger
     * /api/v1/equipment/{id}/get_position:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get the room, floor and building of an equipment
     *     description: >-
     *       Returns a piece of equipment together with the room, floor, building and context it sits in,
     *       each as `{ dynamicId, staticId, name, type }`.
     *
     *
     *       The lookup runs inside the geographic context **named `spatial`** : the digital twin must hold
     *       a context of type `geographicContext` with that exact name, otherwise the request fails with
     *       "spatial context not found".
     *
     *
     *       The equipment must be reachable from the spatial context through the geographic chain; one
     *       hanging outside it makes the request fail.
     *     tags:
     *       - Geographic Context
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the equipment (a `BIMObject`).
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The equipment with its room, floor, building and context.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Position'
     *       400:
     *         description: >-
     *           The spatial context is missing, or the equipment is not attached to a room, a floor and a
     *           building of that context ("Failed to get position").
     *       401:
     *         description: The profile is not allowed to read this equipment.
     */
    app.get("/api/v1/equipment/:id/get_position", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const spatialContextId = (await (0, getSpatialContext_1.getSpatialContext)(spinalAPIMiddleware, profileId)).getId().get();
            const position = await (0, getPosition_1.getEquipmentPosition)(spinalAPIMiddleware, profileId, spatialContextId, parseInt(req.params.id, 10));
            res.json(position);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send(error.message || "Failed to get position");
        }
    });
};
//# sourceMappingURL=getEquipmentPositionNode.js.map