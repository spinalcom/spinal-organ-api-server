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
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/building/read:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Read the building
     *     description: >-
     *       Returns the **first building of the first geographic context** the profile can reach, with
     *       its `address` (the `Adresse` attribute of its `Spinal Building Information` category) and its
     *       `area` (the `area` attribute of its `Spatial` category).
     *
     *
     *       There is no building ID to pass : a twin holding several geographic contexts or several
     *       buildings will always be answered with the first one. Attributes that are missing simply come
     *       back as `undefined`.
     *     tags:
     *       - Geographic Context
     *     responses:
     *       200:
     *         description: The building with its address and area.
     *         content:
     *           application/json:
     *             schema:
     *                $ref: '#/components/schemas/Building'
     *       401:
     *         description: The profile is not allowed to read the graph.
     *       500:
     *         description: >-
     *           The profile graph could not be read, or the twin holds no geographic context or no
     *           building.
     */
    app.get('/api/v1/building/read', async (req, res, next) => {
        try {
            let address;
            let area;
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const contexts = await graph.getChildren('hasContext');
            // var geographicContexts = await SpinalGraphService.getContextWithType("geographicContext");
            const geographicContexts = contexts.filter((el) => el.getType().get() === 'geographicContext');
            const buildings = await geographicContexts[0].getChildren('hasGeographicBuilding');
            const building = buildings[0];
            const addressAttributes = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getAttributesByCategory(building, 'Spinal Building Information');
            const spatialAttributes = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getAttributesByCategory(building, 'Spatial');
            for (const addressAttribute of addressAttributes) {
                if (addressAttribute.label.get() === 'Adresse') {
                    address = addressAttribute.value.get();
                }
            }
            for (const spatialAttribute of spatialAttributes) {
                if (spatialAttribute.label.get() === 'area') {
                    area = spatialAttribute.value.get();
                }
            }
            const info = {
                dynamicId: building._server_id,
                staticId: building.getId().get(),
                name: building.getName().get(),
                type: building.getType().get(),
                address: address,
                area: area,
            };
            return res.json(info);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
    });
};
//# sourceMappingURL=readBuilding.js.map