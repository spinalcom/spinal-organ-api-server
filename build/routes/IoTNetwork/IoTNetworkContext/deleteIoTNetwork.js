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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/IoTNetworkContext/{id}/delete:
     *   delete:
     *     security:
     *       - bearerAuth:
     *         - write
     *     summary: Delete a network context
     *     description: >-
     *       Removes a context of type `Network` from the graph, with everything that hangs under it -
     *       networks, devices and endpoints included. This is not reversible.
     *     tags:
     *       - IoTNetwork & Time Series
     *     parameters:
     *      - in: path
     *        name: id
     *        description: Dynamic ID of the network context.
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     responses:
     *       200:
     *         description: The context was deleted. The body is empty.
     *       400:
     *         description: The node is not a network context ("this context is not a Network").
     *       401:
     *         description: The profile is not allowed to delete this context.
     *       500:
     *         description: The context could not be loaded or removed.
     */
    app.delete("/api/v1/IoTNetworkContext/:id/delete", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const IoTNetwork = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            if (IoTNetwork.getType().get() === "Network") {
                IoTNetwork.removeFromGraph();
            }
            else {
                res.status(400).send("this context is not a Network");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json();
    });
};
//# sourceMappingURL=deleteIoTNetwork.js.map