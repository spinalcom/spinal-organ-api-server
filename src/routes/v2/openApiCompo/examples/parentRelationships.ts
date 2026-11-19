/**
 * @swagger
 * components:
 *   examples:
 *     parentRelationshipsGrouped:
 *       summary: Multiple incoming relations, with a shared parent
 *       description: |-
 *         Example for `GET /api/v2/node/1000501/parent-relationships?info=name,type`.
 *
 *         Room A appears in both `LstPtr / hasSensor` and `Ref / monitors`.
 *         Relation names describe the original parent-to-child direction.
 *         `total` is **3 relationship occurrences**, not 2 distinct parents.
 *
 *         `nodeDynamicId` identifies the queried sensor. Returned parent items omit `parentDynamicId`.
 *       value:
 *         nodeDynamicId: 1000501
 *         data:
 *           LstPtr:
 *             hasSensor:
 *               - dynamicId: 1000101
 *                 info:
 *                   name: Room A
 *                   type: geographicRoom
 *           PtrLst:
 *             hasSensor:
 *               - dynamicId: 1000102
 *                 info:
 *                   name: Room B
 *                   type: geographicRoom
 *           Ref:
 *             monitors:
 *               - dynamicId: 1000101
 *                 info:
 *                   name: Room A
 *                   type: geographicRoom
 *         offset: 0
 *         total: 3
 *     parentRelationshipsProjected:
 *       summary: A later page with selected parent attributes and element fields
 *       description: |-
 *         Example for `GET /api/v2/node/1000501/parent-relationships?relationType=PtrLst&relationName=hasSensor&info=false&attributes=Technical/Code&element=metadata.zone&offset=200`.
 *
 *         Projections apply to the returned parents, not the queried sensor.
 *         `info` is omitted and selected element paths retain their nested structure.
 *         The offset skips 200 matching occurrences globally; `total` counts only this page.
 *       value:
 *         nodeDynamicId: 1000501
 *         data:
 *           PtrLst:
 *             hasSensor:
 *               - dynamicId: 1000301
 *                 attributes:
 *                   Technical:
 *                     Code: "ROOM-201"
 *                 element:
 *                   metadata:
 *                     zone: North
 *         offset: 200
 *         total: 1
 *     parentRelationshipsEmpty:
 *       summary: No matching incoming relationships or parents
 *       description: Empty groups are omitted. A node without parents, unmatched selectors/filters, or an offset beyond all matches returns this shape.
 *       value:
 *         nodeDynamicId: 1000501
 *         data: {}
 *         offset: 0
 *         total: 0
 */
