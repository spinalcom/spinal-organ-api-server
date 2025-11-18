"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("spinal-env-viewer-context-geographic-service/build/constants");
const requestUtilities_1 = require("../../utilities/requestUtilities");
const all_GeoType = constants_1.GEOGRAPHIC_TYPES_ORDER.concat(constants_1.CONTEXT_TYPE);
/**
 * BFS traversal returning node + parent
 */
async function* visitNodesWithParent(root, relationMap) {
    const seen = new Set([root]);
    const queue = [
        { node: root, parent: null }
    ];
    while (queue.length) {
        const item = queue.shift();
        const node = item.node;
        yield item;
        const type = node.info.type.get();
        const relations = relationMap[type];
        if (!relations)
            continue;
        const children = await node.getChildren(relations);
        for (const child of children) {
            if (!seen.has(child)) {
                seen.add(child);
                queue.push({ node: child, parent: node });
            }
        }
    }
}
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * Load root nodes (can be multiple)
     */
    async function getRootNodes(dynIds, profileId) {
        const ids = Array.isArray(dynIds) ? dynIds : [dynIds];
        const result = [];
        for (const dynId of ids) {
            try {
                const n = await spinalAPIMiddleware.load(dynId, profileId);
                if (n instanceof spinal_env_viewer_graph_service_1.SpinalNode && all_GeoType.includes(n.info.type.get())) {
                    result.push(n);
                }
            }
            catch (e) {
                console.error(`Error load dynId = ${dynId}`, e);
            }
        }
        return result;
    }
    /**
     * Build relations to traverse
     */
    function getRelationListFromOption(options) {
        const baseRelation = [
            constants_1.SITE_RELATION,
            constants_1.BUILDING_RELATION,
            constants_1.FLOOR_RELATION,
            constants_1.ZONE_RELATION,
            constants_1.ROOM_RELATION,
        ];
        const floor = options.floorRef
            ? baseRelation.concat([constants_1.REFERENCE_RELATION])
            : baseRelation;
        const room = baseRelation.concat();
        if (options.roomRef)
            room.push(`${constants_1.REFERENCE_RELATION}.ROOM`);
        if (options.equipements)
            room.push(constants_1.EQUIPMENT_RELATION);
        return {
            [constants_1.CONTEXT_TYPE]: baseRelation,
            [constants_1.SITE_TYPE]: baseRelation,
            [constants_1.BUILDING_TYPE]: baseRelation,
            [constants_1.FLOOR_TYPE]: floor,
            [constants_1.ZONE_TYPE]: baseRelation,
            [constants_1.ROOM_TYPE]: room,
        };
    }
    /**
     * @swagger
     * /api/v1/geographicContext/viewInfo2:
     *   post:
     *     security:
     *       - bearerAuth:
     *         - read
     *     description: Fetches view information based on the geographical context for specified IDs and options
     *     summary: Fetch view information for geographical context
     *     tags:
     *       - Geographic Context
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - dynamicId
     *             properties:
     *               dynamicId:
     *                 type: integer
     *                 format: int64
     *                 description: Unique identifier for the node
     *               floorRef:
     *                 type: boolean
     *                 description: Flag to include floor reference, defaults to false
     *               roomRef:
     *                 type: boolean
     *                 description: Flag to include room reference, defaults to true
     *               equipements:
     *                 type: boolean
     *                 description: Flag to include equipment details, defaults to false
     *     responses:
     *       200:
     *         description: Flattened geographic tree with BIM alias dictionary
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 bimFileAlias:
     *                   type: object
     *                   additionalProperties:
     *                     type: string
     *                   example:
     *                     "1": "SpinalNode-7cc0401e-31fc-40c8-385d-c618d1df8bd2"
     *                     "2": "SpinalNode-a39ef912-7df0-11ee-995d-afa741c67b94"
     *                 nodes:
     *                   type: array
     *                   items:
     *                     $ref: "#/components/schemas/ViewInfoNode"
     *       "400":
     *         description: Invalid request (missing dynamicId)
     *       "500":
     *         description: Internal server error
     */
    app.post('/api/v1/geographicContext/viewInfo2', async (req, res) => {
        const body = req.body;
        const profileId = (0, requestUtilities_1.getProfileId)(req);
        const options = {
            dynamicId: body.dynamicId,
            floorRef: body.floorRef || false,
            roomRef: body.roomRef || true,
            equipements: body.equipements || false,
        };
        // Default behavior: if no dynamicId → return whole building
        if (!options.dynamicId) {
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const contexts = await graph.getChildren("hasContext");
            const geoContexts = contexts.filter(el => el.getType().get() === "geographicContext");
            const buildings = await geoContexts[0].getChildren("hasGeographicBuilding");
            const building = buildings[0];
            options.dynamicId = building._server_id;
            options.floorRef = true;
            options.roomRef = true;
            options.equipements = true;
        }
        // LOAD ROOT NODES
        const roots = await getRootNodes(options.dynamicId, profileId);
        const relations = getRelationListFromOption(options);
        // FLATTENED STRUCTURE
        const flatNodes = [];
        // BIM alias dictionary
        const bimFileAlias = {};
        let aliasCounter = 1;
        function getAlias(bimFileId) {
            if (!bimFileAlias[bimFileId]) {
                bimFileAlias[bimFileId] = aliasCounter++;
            }
            return bimFileAlias[bimFileId];
        }
        // TRAVERSE EACH ROOT
        for (const root of roots) {
            for await (const { node, parent } of visitNodesWithParent(root, relations)) {
                const type = node.info.type.get();
                const dynamicId = node._server_id;
                let dbId = null;
                let alias = null;
                if (type === constants_1.REFERENCE_TYPE || type === constants_1.EQUIPMENT_TYPE) {
                    dbId = node.info.dbid.get();
                    alias = getAlias(node.info.bimFileId.get());
                }
                flatNodes.push({
                    dynamicId,
                    parentId: parent ? parent._server_id : null,
                    dbId,
                    bimFileAlias: alias,
                    type
                });
            }
        }
        // RETURN FLAT RESULT
        return res.json({
            bimFileAlias,
            nodes: flatNodes
        });
    });
};
//# sourceMappingURL=viewInfo2.js.map