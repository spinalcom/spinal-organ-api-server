/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

/**
 * @swagger
 * components:
 *   examples:
 *     childRelationshipsGrouped:
 *       summary: Multiple relation types and names, with a shared child
 *       description: |-
 *         Example for `GET /api/v2/node/101/child-relationships?info=name,type`.
 *
 *         Sensor 501 appears in both `LstPtr / hasSensor` and `Ref / monitors`.
 *         `total` is **4 relationship occurrences**, not 3 distinct children.
 *       value:
 *         parentDynamicId: 101
 *         data:
 *           LstPtr:
 *             hasSensor:
 *               - dynamicId: 501
 *                 parentDynamicId: 101
 *                 info:
 *                   name: Temperature sensor
 *                   type: sensor
 *               - dynamicId: 502
 *                 parentDynamicId: 101
 *                 info:
 *                   name: Humidity sensor
 *                   type: sensor
 *             hasDocument:
 *               - dynamicId: 503
 *                 parentDynamicId: 101
 *                 info:
 *                   name: Maintenance guide
 *                   type: document
 *           Ref:
 *             monitors:
 *               - dynamicId: 501
 *                 parentDynamicId: 101
 *                 info:
 *                   name: Temperature sensor
 *                   type: sensor
 *         offset: 0
 *         total: 4
 *     childRelationshipsProjected:
 *       summary: A later page with selected attributes and element fields
 *       description: |-
 *         Example for `GET /api/v2/node/101/child-relationships?relationType=LstPtr&relationName=hasSensor&info=false&attributes=Technical/Code&element=value,metadata.unit&offset=200`.
 *
 *         `info` is omitted. Selected element paths retain their nested structure.
 *         The offset skips 200 matching occurrences globally; `total` counts only this page.
 *       value:
 *         parentDynamicId: 101
 *         data:
 *           LstPtr:
 *             hasSensor:
 *               - dynamicId: 701
 *                 parentDynamicId: 101
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
 *         parentDynamicId: 101
 *         data: {}
 *         offset: 0
 *         total: 0
 */
