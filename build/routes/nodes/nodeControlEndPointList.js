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
const requestUtilities_1 = require("../../utilities/requestUtilities");
const getControlEndpointsInfo_1 = require("../../utilities/getControlEndpointsInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
  * @swagger
  * /api/v1/node/{id}/control_endpoint_list:
  *   get:
  *     security:
  *       - bearerAuth:
  *         - readOnly
  *     description: Return list of control endpoint
  *     summary: Gets a list of control endpoint
  *     tags:
  *      - Nodes
  *     parameters:
  *      - in: path
  *        name: id
  *        description: use the dynamic ID
  *        required: true
  *        schema:
  *          type: integer
  *          format: int64
  *      - in: query
  *        name: includeDetails
  *        description: include detailed endpoint information
  *        required: false
  *        schema:
  *          type: boolean
  *     responses:
  *       200:
  *         description: Success
  *         content:
  *           application/json:
  *             schema:
  *               type: array
  *               items:
  *                $ref: '#/components/schemas/EndPointNode'
  *       400:
  *         description: Bad request
   */
    app.get("/api/v1/node/:id/control_endpoint_list", async (req, res, next) => {
        try {
            const includeDetails = req.query.includeDetails === 'true';
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const endpointsInfo = await (0, getControlEndpointsInfo_1.getControlEndpointsInfo)(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10), includeDetails);
            return res.status(200).send(endpointsInfo);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send("list of endpoints is not loaded");
        }
    });
};
//# sourceMappingURL=nodeControlEndPointList.js.map