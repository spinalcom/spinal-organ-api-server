"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("spinal-env-viewer-context-geographic-service/build/constants");
const requestUtilities_1 = require("../../utilities/requestUtilities");
const all_GeoType = constants_1.GEOGRAPHIC_TYPES_ORDER.concat(constants_1.CONTEXT_TYPE);
/**
 * BFS traversal returning node + parent + relation used
 */
async function* visitNodesWithParent(root, relationMap) {
    const seen = new Set([root]);
    const queue = [
        { node: root, parent: null, relation: null }
    ];
    while (queue.length) {
        const item = queue.shift();
        const node = item.node;
        yield item;
        const type = node.info.type.get();
        const relations = relationMap[type];
        if (!relations)
            continue;
        // Iterate relations individually to track which relation led to each child
        const relArray = Array.isArray(relations) ? relations : [relations];
        for (const rel of relArray) {
            const children = await node.getChildren([rel]);
            for (const child of children) {
                if (!seen.has(child)) {
                    seen.add(child);
                    queue.push({ node: child, parent: node, relation: rel });
                }
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
     *     summary: Fetch a flattened geographic tree for the 3D viewer
     *     description: |
     *       Walks the geographic context from one or more starting nodes and returns the
     *       sub-tree flattened into a lookup map, together with a dictionary that compresses the
     *       repeated BIM file identifiers into small integers.
     *
     *       Unlike `/api/v1/geographicContext/viewInfo`, which returns a nested array, this route
     *       returns `nodes` as an **object keyed by dynamicId**. Walk it by following `children`
     *       from the roots (the entries whose `parentId` is `null`).
     *
     *       **What gets traversed**
     *
     *       Building, Floor and Room relations are always followed. The `floorRef`,
     *       `roomRef` and `equipements` flags add reference and BIM-object relations on top of that,
     *       so they widen the tree rather than filter it. A starting node is skipped if it cannot be
     *       loaded under the caller's profile, or if its type is not a geographic one — if none of the
     *       ids qualify the response is a successful `200` with empty `nodes`, not an error.
     *     tags:
     *       - Geographic Context
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               dynamicId:
     *                 description: |
     *                   Node(s) to start the traversal from. Accepts a single dynamicId or an array of
     *                   them; each one is traversed independently and all results are merged into the
     *                   same `nodes` map. Only geographic nodes are accepted as roots
     *                   (`geographicBuilding`, `geographicFloor`, `geographicRoom`, `BIMObject`);
     *                   anything else is ignored.
     *
     *                   Omit it to fall back to the whole building: the first `geographicBuilding` of
     *                   the first geographic context visible to the profile, with `floorRef`, `roomRef`
     *                   and `equipements` all forced to `true`. Any flags sent alongside an omitted
     *                   `dynamicId` are overridden.
     *                 oneOf:
     *                   - type: integer
     *                     format: int64
     *                   - type: array
     *                     items:
     *                       type: integer
     *                       format: int64
     *                 example: 24062000
     *               floorRef:
     *                 type: boolean
     *                 default: false
     *                 description: |
     *                   Follow `hasReferenceObject` from floors, adding the floor's reference BIM
     *                   objects to the tree as nodes of type `floorRef`.
     *               roomRef:
     *                 type: boolean
     *                 default: false
     *                 description: |
     *                   Follow `hasReferenceObject.ROOM` from rooms, adding the room's reference BIM
     *                   objects to the tree as nodes of type `roomRef`.
     *               equipements:
     *                 description: |
     *                   Follow `hasBimObject` from rooms, adding the room's equipment as nodes of type
     *                   `BIMObject`.
     *
     *                   Pass `true` for every piece of equipment, `false` (default) for none, or an
     *                   array of group filters to keep only the equipment belonging to the named
     *                   groups. Filters are resolved once up front into a set of allowed group ids;
     *                   a piece of equipment survives if any of its `groupHasBIMObject` parents is in
     *                   that set, so filters are additive — an item matching any one of them is kept.
     *                   A filter naming a context, category or group that does not exist contributes
     *                   nothing and is silently ignored, so an array that matches nothing yields a
     *                   tree with no equipment at all.
     *                 oneOf:
     *                   - type: boolean
     *                   - type: array
     *                     items:
     *                       type: object
     *                       required:
     *                         - contextName
     *                         - categoryName
     *                         - groupNames
     *                       properties:
     *                         contextName:
     *                           type: string
     *                           description: Name of the context holding the groups, matched exactly.
     *                           example: BIMObject Context
     *                         categoryName:
     *                           type: string
     *                           description: Name of the category inside that context, matched exactly.
     *                           example: Zone
     *                         groupNames:
     *                           type: array
     *                           description: |
     *                             Names of the groups to keep, matched exactly. An empty array means
     *                             every group in the category.
     *                           items:
     *                             type: string
     *                           example: ["CVC", "Plomberie"]
     *                 default: false
     *           examples:
     *             wholeBuilding:
     *               summary: Whole building (no dynamicId)
     *               description: Falls back to the first building, with every reference and all equipment.
     *               value: {}
     *             singleFloorWithRefs:
     *               summary: One floor, references only
     *               value:
     *                 dynamicId: 24062000
     *                 floorRef: true
     *                 roomRef: true
     *             floorWithEquipment:
     *               summary: One floor, room references and all equipment
     *               description: |
     *                 Both flags default to false, so each one has to be asked for explicitly.
     *               value:
     *                 dynamicId: 24062000
     *                 roomRef: true
     *                 equipements: true
     *             filteredEquipment:
     *               summary: Two floors, equipment restricted to two groups
     *               value:
     *                 dynamicId: [24062000, 24062104]
     *                 equipements:
     *                   - contextName: BIMObject Context
     *                     categoryName: Zone
     *                     groupNames: ["CVC", "Plomberie"]
     *     responses:
     *       200:
     *         description: Flattened geographic tree with its BIM file dictionary.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 bimFileAlias:
     *                   type: object
     *                   description: |
     *                     Dictionary of the BIM files referenced by the tree, keyed by BIM file id with
     *                     the alias as value. Aliases are assigned in traversal order starting at 1 and
     *                     are only meaningful within this response.
     *
     *                     Note the direction: nodes carry the **alias**, so resolving a node back to its
     *                     BIM file id means inverting this map client-side.
     *                   additionalProperties:
     *                     type: integer
     *                   example:
     *                     "SpinalNode-7cc0401e-31fc-40c8-385d-c618d1df8bd2": 1
     *                     "SpinalNode-a39ef912-7df0-11ee-995d-afa741c67b94": 2
     *                 nodes:
     *                   type: object
     *                   description: |
     *                     Every visited node, keyed by its dynamicId. Empty when no starting node
     *                     resolved to a geographic node.
     *                   additionalProperties:
     *                     $ref: "#/components/schemas/ViewInfoNode"
     *             example:
     *               bimFileAlias:
     *                 "SpinalNode-7cc0401e-31fc-40c8-385d-c618d1df8bd2": 1
     *               nodes:
     *                 "24062000":
     *                   parentId: null
     *                   children: [24063840]
     *                   dbId: null
     *                   bimFileAlias: null
     *                   type: geographicFloor
     *                 "24063840":
     *                   parentId: 24062000
     *                   children: [24063912]
     *                   dbId: null
     *                   bimFileAlias: null
     *                   type: geographicRoom
     *                 "24063912":
     *                   parentId: 24063840
     *                   children: []
     *                   dbId: 3365
     *                   bimFileAlias: 1
     *                   type: BIMObject
     *       "500":
     *         description: Internal server error
     */
    app.post('/api/v1/geographicContext/viewInfo2', async (req, res) => {
        const body = req.body;
        const profileId = (0, requestUtilities_1.getProfileId)(req);
        const options = {
            dynamicId: body.dynamicId,
            floorRef: body.floorRef || false,
            roomRef: body.roomRef || false,
            equipements: body.equipements || false,
        };
        // Default behavior: if no dynamicId -> return whole building
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
        // PRELOAD allowed group node IDs when equipements is an array filter
        let allowedGroupIds = null;
        if (Array.isArray(options.equipements)) {
            allowedGroupIds = new Set();
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const allContexts = await graph.getChildren('hasContext');
            for (const filter of options.equipements) {
                const ctx = allContexts.find((c) => c.info.name.get() === filter.contextName);
                if (!ctx)
                    continue;
                const categories = await ctx.getChildren('hasCategory');
                const cat = categories.find((c) => c.info.name.get() === filter.categoryName);
                if (!cat)
                    continue;
                const groups = await cat.getChildren('hasGroup');
                if (filter.groupNames.length === 0) {
                    // empty groupNames means all groups in this category
                    for (const g of groups)
                        allowedGroupIds.add(g.getId().get());
                }
                else {
                    for (const g of groups) {
                        if (filter.groupNames.includes(g.info.name.get())) {
                            allowedGroupIds.add(g.getId().get());
                        }
                    }
                }
            }
        }
        // LOAD ROOT NODES
        const roots = await getRootNodes(options.dynamicId, profileId);
        const relations = getRelationListFromOption(options);
        // FLATTENED STRUCTURE
        // const flatNodes: Array<{
        //   dynamicId: number;
        //   parentId: number | null;
        //   dbId: number | null;
        //   bimFileAlias: number | null;
        //   type: string;
        // }> = [];
        const nodes = {};
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
            for await (const { node, parent, relation } of visitNodesWithParent(root, relations)) {
                const dynamicId = node._server_id;
                const parentId = parent ? parent._server_id : null;
                let type = node.info.type.get();
                // Override type for BIM objects reached via reference relations
                if (relation === `${constants_1.REFERENCE_RELATION}.ROOM`) {
                    type = 'roomRef'; // Room reference objects
                }
                else if (relation === constants_1.REFERENCE_RELATION && parent?.info.type.get() === constants_1.FLOOR_TYPE) {
                    type = 'floorRef'; // Floor reference objects
                }
                // Filter equipment by allowed groups when using array filter
                if (type === constants_1.EQUIPMENT_TYPE && allowedGroupIds !== null) {
                    const parentGroups = await node.getParents('groupHasBIMObject');
                    const belongsToAllowed = parentGroups.some((g) => allowedGroupIds.has(g.getId().get()));
                    if (!belongsToAllowed)
                        continue;
                }
                let dbId = null;
                let alias = null;
                if (type === constants_1.REFERENCE_TYPE || type === constants_1.EQUIPMENT_TYPE || type === 'roomRef' || type === 'floorRef') {
                    dbId = node.info.dbid.get();
                    alias = getAlias(node.info.bimFileId.get());
                }
                // Ensure current node exists
                if (!nodes[dynamicId]) {
                    nodes[dynamicId] = {
                        parentId,
                        children: [],
                        dbId,
                        bimFileAlias: alias,
                        type
                    };
                }
                // Ensure parent exists & register child
                if (parentId !== null) {
                    if (!nodes[parentId]) {
                        nodes[parentId] = {
                            parentId: null,
                            children: [],
                            dbId: null,
                            bimFileAlias: null,
                            type: parent.info.type.get()
                        };
                    }
                    nodes[parentId].children.push(dynamicId);
                }
            }
        }
        return res.json({
            bimFileAlias,
            nodes
        });
    });
};
//# sourceMappingURL=viewInfo2.js.map