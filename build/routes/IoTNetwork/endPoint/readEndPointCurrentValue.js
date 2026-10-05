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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/endpoint/{id}/read:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read the current value of an endpoint
     *     description: >-
     *       Returns `{ currentValue }` for one endpoint : the last value the hub knows, not a fresh
     *       reading from the field device. Its type follows the endpoint (number, boolean or string).
     *
     *
     *       For the unit, the type and the time-series flags of the endpoint, read the node it hangs on
     *       with `/api/v1/node/{id}/endpoint_list`.
     *     tags:
     *       - IoTNetwork & Time Series
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the endpoint.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The current value of the endpoint.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/CurrentValue'
     *       400:
     *         description: The node could not be loaded, or it carries no element with a current value.
     *       401:
     *         description: The profile is not allowed to read this endpoint.
     */
    app.get("/api/v1/endpoint/:id/read", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            const element = await node.element.load();
            var info = { currentValue: element.currentValue.get() };
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send(error.message);
        }
        res.json(info);
    });
};
//# sourceMappingURL=readEndPointCurrentValue.js.map