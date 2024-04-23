"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestUtilities_1 = require("../../utilities/requestUtilities");
const getPosition_1 = require("../../utilities/getPosition");
const getSpatialContext_1 = require("../../utilities/getSpatialContext");
module.exports = function (logger, app, spinalAPIMiddleware) {
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
   *     description: Get equipement position
   *     summary: Get equipement position
   *     tags:
   *       - Geographic Context
   *     parameters:
   *      - in: path
   *        name: id
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
   *                $ref: '#/components/schemas/Position'
   *       400:
   *         description: Bad request
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