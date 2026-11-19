/**
 * @swagger
 * components:
 *   examples:
 *     childRelationshipsGrouped:
 *       summary: Multiple relation types and names, with a shared child
 *       description: |-
 *         Example for `GET /api/v2/node/1000101/child-relationships?info=name,type`.
 *
 *         Sensor 1000501 appears in both `LstPtr / hasSensor` and `Ref / monitors`.
 *         `total` is **4 relationship occurrences**, not 3 distinct children.
 *       value:
 *         parentDynamicId: 1000101
 *         data:
 *           LstPtr:
 *             hasSensor:
 *               - dynamicId: 1000501
 *                 parentDynamicId: 1000101
 *                 info:
 *                   name: Temperature sensor
 *                   type: sensor
 *               - dynamicId: 1000502
 *                 parentDynamicId: 1000101
 *                 info:
 *                   name: Humidity sensor
 *                   type: sensor
 *             hasDocument:
 *               - dynamicId: 1000503
 *                 parentDynamicId: 1000101
 *                 info:
 *                   name: Maintenance guide
 *                   type: document
 *           Ref:
 *             monitors:
 *               - dynamicId: 1000501
 *                 parentDynamicId: 1000101
 *                 info:
 *                   name: Temperature sensor
 *                   type: sensor
 *         offset: 0
 *         total: 4
 *     childRelationshipsProjected:
 *       summary: A later page with selected attributes and element fields
 *       description: |-
 *         Example for `GET /api/v2/node/1000101/child-relationships?relationType=LstPtr&relationName=hasSensor&info=false&attributes=Technical/Code&element=value,metadata.unit&offset=200`.
 *
 *         `info` is omitted. Selected element paths retain their nested structure.
 *         The offset skips 200 matching occurrences globally; `total` counts only this page.
 *       value:
 *         parentDynamicId: 1000101
 *         data:
 *           LstPtr:
 *             hasSensor:
 *               - dynamicId: 1000701
 *                 parentDynamicId: 1000101
 *                 attributes:
 *                   Technical:
 *                     Code: "TEMP-201"
 *                 element:
 *                   value: 21.5
 *                   metadata:
 *                     unit: Celsius
 *         offset: 200
 *         total: 1
 *     childRelationshipsEmpty:
 *       summary: No matching relationships or children
 *       description: Empty groups are omitted. An empty parent, unmatched selectors/filters, or an offset beyond all matches returns this shape.
 *       value:
 *         parentDynamicId: 1000101
 *         data: {}
 *         offset: 0
 *         total: 0
 */
