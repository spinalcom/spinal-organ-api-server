"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupPageByParent = groupPageByParent;
/**
 * Groups already-paginated items by the parent they were found under.
 * Groups keep the order in which their parents first appear in `page`, and
 * parents with no item in the page are omitted.
 */
function groupPageByParent(page, items) {
    const groups = new Map();
    page.forEach(({ parentId }, index) => {
        const group = groups.get(parentId);
        if (group)
            group.push(items[index]);
        else
            groups.set(parentId, [items[index]]);
    });
    return [...groups].map(([parentDynamicId, data]) => ({
        parentDynamicId,
        data,
    }));
}
//# sourceMappingURL=groupByParent.js.map