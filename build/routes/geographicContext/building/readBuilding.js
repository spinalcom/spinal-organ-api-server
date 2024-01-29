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
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/building/read:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: read building
     *     summary: Gets building
     *     tags:
     *       - Geographic Context
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Building'
     *       400:
     *         description: Bad request
     */
    app.get("/api/v1/building/read", async (req, res, next) => {
        try {
            var address;
            var sommes = 0;
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const contexts = await graph.getChildren("hasContext");
            // var geographicContexts = await SpinalGraphService.getContextWithType("geographicContext");
            var geographicContexts = contexts.filter(el => el.getType().get() === "geographicContext");
            var building = await geographicContexts[0].getChildren("hasGeographicBuilding");
            var floors = await building[0].getChildren("hasGeographicFloor");
            for (let index = 0; index < floors.length; index++) {
                var rooms = await floors[index].getChildren("hasGeographicRoom");
                for (const room of rooms) {
                    let categories = await room.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
                    for (const child of categories) {
                        if (child.getName().get() === "Spatial") {
                            let attributs = await child.element.load();
                            for (const attribut of attributs.get()) {
                                if (attribut.label === "area") {
                                    sommes = sommes + attribut.value;
                                }
                            }
                        }
                    }
                }
            }
            let categories = await building[0].getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            for (const child of categories) {
                if (child.getName().get() === "Spinal Building Information") {
                    let attributs = await child.element.load();
                    for (const attribut of attributs.get()) {
                        if (attribut.label === "Adresse") {
                            address = attribut.value;
                        }
                    }
                }
            }
            if (building[0].getType().get() === "geographicBuilding") {
                var info = {
                    dynamicId: building[0]._server_id,
                    staticId: building[0].getId().get(),
                    name: building[0].getName().get(),
                    type: building[0].getType().get(),
                    address: address,
                    area: sommes
                };
            }
            else {
                res.status(400).send("node is not of type geographic building");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(info);
    });
};
//# sourceMappingURL=readBuilding.js.map