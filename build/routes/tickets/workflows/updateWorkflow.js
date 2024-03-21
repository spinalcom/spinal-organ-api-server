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
     * /api/v1/workflow/{id}/update:
     *   put:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: update the workflow
     *     summary: update the workflow
     *     tags:
     *       - Workflow & ticket
     *     parameters:
     *      - in: path
     *        name: id
     *        description: use the dynamic ID
     *        required: true
     *        schema:
     *          type: integer
     *          format: int64
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - newNameWorkflow
     *             properties:
     *                newNameWorkflow:
     *                 type: string
     *     responses:
     *       200:
     *         description: Success
     *       400:
     *         description: Bad request
     */
    app.put("/api/v1/workflow/:id/update", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const workflow = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const childrens = await graph.getChildren("hasContext");
            for (const child of childrens) {
                if (child.getName().get() === req.body.newNameWorkflow) {
                    return res.status(400).send("the name context already exists");
                }
            }
            if (workflow.getType().get() === "SpinalSystemServiceTicket" && req.body.nameWorkflow !== "string") {
                workflow.info.name.set(req.body.newNameWorkflow);
            }
            else {
                return res.status(400).send("this context is not a SpinalSystemServiceTicket Or string is invalid name");
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            return res.status(400).send(error.message);
        }
        res.json();
    });
};
//# sourceMappingURL=updateWorkflow.js.map