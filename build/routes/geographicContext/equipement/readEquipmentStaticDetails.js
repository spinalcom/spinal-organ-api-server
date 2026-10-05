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
const getStaticDetailsInfo_1 = require("../../../utilities/getStaticDetailsInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/equipment/{id}/read_static_details:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Get everything known about an equipment
     *     description: >-
     *       The full read of a piece of equipment in one call : its identity and BIM identifiers, its
     *       attribute categories with their attributes, its control points, its BMS endpoints with their
     *       current values, and the groups it belongs to.
     *
     *
     *       The node must be of type `BIMObject`. This is the equipment counterpart of
     *       `/api/v1/room/{id}/read_static_details`, and the heaviest equipment route.
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
     *         description: The complete static description of the equipment.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/StaticDetailsRoom'
     *       400:
     *         description: The node is not a `BIMObject`, or it could not be loaded (body is `ko`).
     *       401:
     *         description: The profile is not allowed to read this equipment.
     */
    app.get('/api/v1/equipment/:id/read_static_details', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const info = await (0, getStaticDetailsInfo_1.getEquipmentStaticDetailsInfo)(spinalAPIMiddleware, profileId, parseInt(req.params.id, 10));
            return res.json(info);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send('ko');
        }
    });
};
//# sourceMappingURL=readEquipmentStaticDetails.js.map