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
     * /api/v1/Network/{id}/update:
     *   put:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Rename a network
     *     description: >-
     *       Renames a network. Only the name changes - the devices under it are untouched. The node must
     *       be of type `BmsNetwork`.
     *     tags:
     *       - IoTNetwork & Time Series
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the network.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - newNameNetwork
     *             properties:
     *               newNameNetwork:
     *                 type: string
     *                 description: The new name of the network.
     *     responses:
     *       200:
     *         description: The network was renamed. The body is empty.
     *       400:
     *         description: The node is not a network ("this node is not a BmsNetwork"), or it could not be loaded.
     *       401:
     *         description: The profile is not allowed to write on this network.
     */
    app.put("/api/v1/Network/:id/update", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const network = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(network);
            if (network.getType().get() === "BmsNetwork") {
                network.info.name.set(req.body.newNameNetwork);
            }
            else {
                res.status(400).send("this node is not a BmsNetwork");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send(error.message);
        }
        res.json();
    });
};
//# sourceMappingURL=updateBmsNetwork.js.map