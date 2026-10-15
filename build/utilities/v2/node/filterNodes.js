"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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
exports.NODE_FILTER_PAGE_SIZE = void 0;
exports.filterNodes = filterNodes;
const parseFilterQuery_1 = require("../requestParse/parseFilterQuery");
const matchesNodeFilter_1 = require("./matchesNodeFilter");
exports.NODE_FILTER_PAGE_SIZE = 200;
const NODE_FILTER_BATCH_SIZE = 20;
/**
 * Preserves input order, skips offset matching nodes and returns at most 200.
 * Only the returned nodes need conversion to INodeItem using getNodeData.
 * Checks up to 20 nodes concurrently, preserving their input order.
 * Stops reading after the batch that fills the page.
 *
 * @example
 * const filters = parseFilterQuery(req.query);
 * const offset = parseOffsetQuery(req.query);
 * const page = await filterNodes(nodes, filters, offset);
 * const data = await Promise.all(
 *   page.map((node) => getNodeData(node, infoQuery, attrQuery))
 * );
 * res.json({ data });
 */
async function filterNodes(nodes, filters, offset = 0) {
    offset = (0, parseFilterQuery_1.parseOffsetQuery)({ offset });
    const result = [];
    let matched = 0;
    let batch = [];
    async function processBatch() {
        const matches = await Promise.all(batch.map((node) => (0, matchesNodeFilter_1.matchesNodeFilter)(node, filters)));
        for (let index = 0; index < batch.length; index++) {
            if (!matches[index])
                continue;
            if (matched++ < offset)
                continue;
            result.push(batch[index]);
            if (result.length === exports.NODE_FILTER_PAGE_SIZE)
                break;
        }
    }
    for await (const node of nodes) {
        batch.push(node);
        if (batch.length < NODE_FILTER_BATCH_SIZE)
            continue;
        await processBatch();
        if (result.length === exports.NODE_FILTER_PAGE_SIZE)
            break;
        batch = [];
    }
    if (batch.length > 0 && result.length < exports.NODE_FILTER_PAGE_SIZE) {
        await processBatch();
    }
    return result;
}
//# sourceMappingURL=filterNodes.js.map