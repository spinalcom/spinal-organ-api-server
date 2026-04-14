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
exports.getUserData = getUserData;
const awaitSync_1 = require("./awaitSync");
const spinal_model_user_service_1 = require("spinal-model-user-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const createBasicNode_1 = require("./createBasicNode");
async function getUserData(userNode, addAttributs = false, addGroups = false, addOrganizations = false) {
    await (0, awaitSync_1.awaitSync)(userNode); // Wait for the _server_id to be assigned by hub
    const userData = {
        dynamicId: userNode._server_id,
        staticId: userNode.info.id.get(),
        email: userNode.info.name.get(),
    };
    const [categoryAttr, groupNodes] = await Promise.all([
        addAttributs
            ? spinal_env_viewer_plugin_documentation_service_1.attributeService.getCategoryByName(userNode, spinal_model_user_service_1.SPINAL_USER_CATEGORY_ATTRIBUTE_NAME)
            : Promise.resolve(undefined),
        addGroups || addOrganizations
            ? (0, spinal_model_user_service_1.getSpinalUserGroupFromSpinalUser)(userNode)
            : Promise.resolve(undefined),
    ]);
    const attributeDataProm = addAttributs && categoryAttr
        ? spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttributesByCategory(userNode, categoryAttr)
        : Promise.resolve(undefined);
    if (addOrganizations && groupNodes) {
        const organizationNodes = await Promise.all(groupNodes.map(async (group) => {
            const orgs = await (0, spinal_model_user_service_1.getOrganizationFromSpinalUserGroup)(group);
            return { orgs, group };
        }));
        const orgIdSeen = new Set();
        for (const orgNodes of organizationNodes) {
            for (const orgNode of orgNodes.orgs) {
                if (!orgIdSeen.has(orgNode._server_id)) {
                    orgIdSeen.add(orgNode._server_id);
                    userData.organizations = userData.organizations || [];
                    const data = (0, createBasicNode_1.createBasicNode)(orgNode, ['color']);
                    data.userGroupId = orgNodes.group._server_id;
                    userData.organizations.push(data);
                }
            }
        }
    }
    const attributeData = await attributeDataProm;
    if (attributeData) {
        userData.attributes = {};
        for (const [key, attr] of Object.entries(attributeData)) {
            userData.attributes[key] = attr?.value.get();
        }
    }
    if (groupNodes) {
        userData.groups = groupNodes.map((group) => (0, createBasicNode_1.createBasicNode)(group));
    }
    return userData;
}
//# sourceMappingURL=getUserData.js.map