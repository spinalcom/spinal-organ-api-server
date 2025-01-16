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
const getChildrenNodesInfo_1 = require("../../utilities/getChildrenNodesInfo");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/context/{idContext}/node/{idNode}/children:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Retrieve children of multiple nodes based on context and relations.
     *     summary: Retrieve children of multiple nodes based on context and relations
     *     tags:
     *       - Nodes
     *     parameters:
     *       - in: path
     *         name: idContext
     *         description: Context dynamic Id
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *       - in: path
     *         name: idNode
     *         description: Node dynamic Id
     *         required: true
     *         schema:
     *           type: integer
     *           format: int64
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: string
     *     responses:
     *       200:
     *         description: Success -  Information for the specified relations fetched successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BasicNodeMultiple'
     *       400:
     *         description: Bad request - Invalid input or parameters.
     */
    app.post('/api/v1/context/:idContext/node/:idNode/children', async (req, res) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const contextId = req.params.idContext;
            const nodeId = req.params.idNode;
            const relations = req.body;
            if (!Array.isArray(relations)) {
                return res
                    .status(400)
                    .send('Invalid relations format; an array is expected');
            }
            const children = await (0, getChildrenNodesInfo_1.getChildrenNodesInfo)(spinalAPIMiddleware, profileId, parseInt(nodeId, 10), relations, parseInt(contextId, 10));
            return res.status(200).json(children);
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(400).send('An error occurred while fetching children.');
        }
    });
};
//# sourceMappingURL=nodeChildrenInContextSpecificRelations.js.map