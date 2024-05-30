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
     * /api/v1/floor/{id}/floor_details:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Return details of a floor
     *     summary: Gets a details of a floor
     *     tags:
     *      - Geographic Context
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
     *                $ref: '#/components/schemas/FloorDetails'
     *       400:
     *         description: Bad request
     */
    app.get("/api/v1/floor/:id/floor_details", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const floor = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            const rooms = await floor.getChildren("hasGeographicRoom");
            let sommes = 0;
            const _bimObjects = [];
            let bimFileId;
            for (const room of rooms) {
                const bimObjects = await room.getChildren("hasBimObject");
                for (const bimObject of bimObjects) {
                    bimFileId = bimObject.info.bimFileId.get();
                    const infoBimObject = {
                        staticId: bimObject.getId().get(),
                        name: bimObject.getName().get(),
                        type: bimObject.getType().get(),
                        version: bimObject.info.version.get(),
                        externalId: bimObject.info.externalId.get(),
                        dbid: bimObject.info.dbid.get(),
                        bimFileId: bimObject.info.bimFileId.get()
                    };
                    _bimObjects.push(infoBimObject);
                }
                const categories = await room.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
                for (const child of categories) {
                    if (child.getName().get() === "Spatial") {
                        const attributs = await child.element.load();
                        for (const attribut of attributs.get()) {
                            if (attribut.label === "area") {
                                sommes = sommes + attribut.value;
                            }
                        }
                    }
                }
            }
            const info = {
                area: sommes,
                _bimObjects: _bimObjects
            };
            res.json(info);
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of floor is not loaded");
        }
    });
};
//# sourceMappingURL=floorDetails.js.map