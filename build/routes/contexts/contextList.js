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
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Return list of contexts
     *     summary: Gets a list of contexts
     *     tags:
     *      - Contexts/ontologies
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Context'
     *       400:
     *         description: Bad request
     */
    app.get("/api/v1/context/list", async (req, res, next) => {
        let nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            var graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            var relationNames = graph.getRelationNames();
            var childrens = await graph.getChildren(relationNames);
            for (const child of childrens) {
                let info = {
                    dynamicId: child._server_id,
                    staticId: child.getId().get(),
                    name: child.getName().get(),
                    type: child.getType().get(),
                };
                nodes.push(info);
            }
            res.send(nodes);
        }
        catch (error) {
            console.error(error);
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send("list of contexts is not loaded");
        }
    });
};
//# sourceMappingURL=contextList.js.map