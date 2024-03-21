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
   * /api/v1/IoTNetworkContext/{id}/nodeTypeList:
   *   get:
   *     security:
   *       - bearerAuth:
   *         - readOnly
   *     description: Return node type list of IoTNetwork
   *     summary: Get type list in IoTNetwork with given ID
   *     tags:
   *       - IoTNetwork & Time Series
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
   *                $ref: '#/components/schemas/IoTNetworkNodeTypeList'
   *       400:
   *         description: Bad request
  */
    app.get("/api/v1/IoTNetworkContext/:id/nodeTypeList", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const IoTNetwork = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            const SpinalContextId = IoTNetwork.getId().get();
            if (IoTNetwork.getType().get() === "Network") {
                var type_list = await spinal_env_viewer_graph_service_1.SpinalGraphService.browseAndClassifyByTypeInContext(SpinalContextId, SpinalContextId);
            }
            else {
                res.status(400).send("this context is not a Network");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("context not found");
        }
        res.json(type_list.types);
    });
};
//# sourceMappingURL=IoTNetworkTypeList.js.map