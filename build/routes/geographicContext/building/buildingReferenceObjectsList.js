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
const requestUtilities_1 = require("../../../utilities/requestUtilities");
const getBuildingReferenceObjectListInfo_1 = require("../../../utilities/getBuildingReferenceObjectListInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/building/reference_object_list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: List the reference objects of the building
     *     description: >-
     *       Returns the objects attached through `hasReferenceObject` to the **first building of the
     *       first geographic context** the profile can reach. As with `/api/v1/building/read`, there is
     *       no building ID to pass.
     *
     *
     *       Reference objects are BIM objects a node points at without owning them, typically shared
     *       elements such as facades or structural parts.
     *     tags:
     *       - Geographic Context
     *     responses:
     *       200:
     *         description: The building with its reference objects.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 dynamicId:
     *                   type: integer
     *                   format: int64
     *                 staticId:
     *                   type: string
     *                 name:
     *                   type: string
     *                 type:
     *                   type: string
     *                 infoReferencesObjects:
     *                   type: array
     *                   items:
     *                    $ref: '#/components/schemas/Equipement'
     *       400:
     *         description: >-
     *           The profile graph could not be read, or the twin holds no geographic context or no
     *           building ("list of reference_Objects is not loaded").
     *       401:
     *         description: The profile is not allowed to read the graph.
     */
    app.get("/api/v1/building/reference_object_list", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const info = await (0, getBuildingReferenceObjectListInfo_1.getBuildingReferenceObjectsListInfo)(spinalAPIMiddleware, profileId);
            return res.send(info);
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of reference_Objects is not loaded");
        }
    });
};
//# sourceMappingURL=buildingReferenceObjectsList.js.map