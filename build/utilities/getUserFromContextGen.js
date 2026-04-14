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
exports.getUserFromContextGen = getUserFromContextGen;
const spinal_model_user_service_1 = require("spinal-model-user-service");
async function* getUserFromContextGen(userContext, offset = 0) {
    const userAlphaGroups = await (0, spinal_model_user_service_1.getSpinalUserAlphaGroup)(userContext);
    const userAlphaGroupsAndCount = userAlphaGroups.map((group) => ({
        group,
        count: group.children.PtrLst?.[spinal_model_user_service_1.SPINAL_USER_ALPHA_GROUP_RELATION_TO_USER]
            ?.children.info.ids.length || 0,
    }));
    for (let idxGrp = 0; idxGrp < userAlphaGroupsAndCount.length; idxGrp++) {
        const { group, count: nbItemsInGroup } = userAlphaGroupsAndCount[idxGrp];
        if (offset >= nbItemsInGroup) {
            offset -= nbItemsInGroup;
            continue;
        }
        const userNodes = await (0, spinal_model_user_service_1.getSpinalUserFromSpinalUserAlphaGroup)(group, userContext);
        for (let idx = 0; idx < userNodes.length; idx++) {
            const userNode = userNodes[idx];
            if (offset > 0) {
                offset--;
                continue;
            }
            // check if there are more items to send after this one
            if (idx < userNodes.length - 1) {
                yield { userNode, hasMore: true };
            }
            else if (idxGrp < userAlphaGroupsAndCount.length - 1) {
                // if it's the last item in the group, we check if there are more groups with items after this one
                let hasMore = false;
                for (let i = idxGrp + 1; i < userAlphaGroupsAndCount.length; i++) {
                    if (userAlphaGroupsAndCount[i].count > 0) {
                        hasMore = true;
                        break;
                    }
                }
                yield { userNode, hasMore };
            }
            else {
                // if it's the last item of the last group, there is no more item to send after this one
                yield { userNode, hasMore: false };
            }
        }
    }
}
//# sourceMappingURL=getUserFromContextGen.js.map