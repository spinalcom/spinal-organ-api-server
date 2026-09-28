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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const moment_1 = __importDefault(require("moment"));
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/find_node_in_context_by_date:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     summary: Find the nodes of a context modified between two dates
     *     description: >-
     *       Browses a context and returns the nodes whose `directModificationDate` falls between
     *       `beginDate` and `endDate` (both exclusive).
     *
     *
     *       `directModificationDate` is the date of a change made on the node itself (declaring a ticket
     *       on a room, for instance), while `indirectModificationDate` is the date of a change on one of
     *       its parents or children (moving that ticket to another step). Only the direct date is used as
     *       the filter; both are returned. Nodes that never carry a `directModificationDate` are skipped.
     *
     *
     *       Both bounds are parsed in the server's local time and compared in UTC. Accepted formats are
     *       `DD-MM-YYYY`, `DD-MM-YYYY HH:mm:ss`, `DD MM YYYY`, `DD MM YYYY HH:mm:ss`, `DD/MM/YYYY` and
     *       `DD/MM/YYYY HH:mm:ss` - a date in any other format is rejected as invalid and the result is
     *       an empty list.
     *     tags:
     *      - Contexts/ontologies
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - contextId
     *               - beginDate
     *               - endDate
     *             properties:
     *               beginDate:
     *                 type: string
     *                 description: Lower bound, exclusive.
     *                 example: 01-01-2024 00:00:00
     *               endDate:
     *                 type: string
     *                 description: Upper bound, exclusive.
     *                 example: 31-01-2024 23:59:59
     *               contextId:
     *                 type: string
     *                 description: Dynamic ID of the context to browse.
     *     responses:
     *       200:
     *         description: The nodes of the context modified inside the interval.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/NodeWithDate'
     *       401:
     *         description: The profile is not allowed to read this context.
     *       500:
     *         description: The context could not be loaded or browsed.
     */
    app.post('/api/v1/find_node_in_context_by_date', async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const context = await spinalAPIMiddleware.load(parseInt(req.body.contextId, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(context);
            const beginDateTimeZone = (0, moment_1.default)(req.body.beginDate, [
                'DD-MM-YYYY',
                'DD-MM-YYYY HH:mm:ss',
                'DD MM YYYY',
                'DD MM YYYY HH:mm:ss',
                'DD/MM/YYYY',
                'DD/MM/YYYY HH:mm:ss',
            ], true);
            const endDateTimeZone = (0, moment_1.default)(req.body.endDate, [
                'DD-MM-YYYY',
                'DD-MM-YYYY HH:mm:ss',
                'DD MM YYYY',
                'DD MM YYYY HH:mm:ss',
                'DD/MM/YYYY',
                'DD/MM/YYYY HH:mm:ss',
            ], true);
            const beginDate = beginDateTimeZone.utc();
            const endDate = endDateTimeZone.utc();
            var tab = [];
            await spinal_env_viewer_graph_service_1.SpinalGraphService.findInContext(context.getId().get(), context.getId().get(), (node) => {
                if (node.info.directModificationDate) {
                    const nodeDate = (0, moment_1.default)(node.info.directModificationDate.get());
                    const test = (0, moment_1.default)(nodeDate).isBetween(beginDate, endDate);
                    if (test == true) {
                        const info = {
                            dynamicId: node._server_id,
                            staticId: node.getId().get(),
                            name: node.getName().get(),
                            type: node.getType().get(),
                            directModificationDate: node.info.directModificationDate === undefined
                                ? ''
                                : node.info.directModificationDate.get(),
                            indirectModificationDate: node.info.indirectModificationDate === undefined
                                ? ''
                                : node.info.directModificationDate.get(),
                        };
                        tab.push(info);
                    }
                }
                return true;
            });
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            res.status(500).send(error.message);
        }
        res.json(tab);
    });
};
//# sourceMappingURL=contextFindNodeByDate.js.map