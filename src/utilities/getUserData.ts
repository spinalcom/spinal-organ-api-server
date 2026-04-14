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

import type { IUser } from '../routes/interface/IUser';
import type { SpinalNode } from 'spinal-model-graph';
import { awaitSync } from './awaitSync';
import {
  getSpinalUserGroupFromSpinalUser,
  getOrganizationFromSpinalUserGroup,
  SPINAL_USER_CATEGORY_ATTRIBUTE_NAME,
} from 'spinal-model-user-service';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { createBasicNode } from './createBasicNode';

export async function getUserData(
  userNode: SpinalNode,
  addAttributs = false,
  addGroups = false,
  addOrganizations = false
): Promise<IUser> {
  await awaitSync(userNode); // Wait for the _server_id to be assigned by hub
  const userData: IUser = {
    dynamicId: userNode._server_id!,
    staticId: userNode.info.id.get(),
    email: userNode.info.name.get(),
  };

  const [categoryAttr, groupNodes] = await Promise.all([
    addAttributs
      ? attributeService.getCategoryByName(
          userNode,
          SPINAL_USER_CATEGORY_ATTRIBUTE_NAME
        )
      : Promise.resolve(undefined),
    addGroups || addOrganizations
      ? getSpinalUserGroupFromSpinalUser(userNode)
      : Promise.resolve(undefined),
  ]);

  const attributeDataProm =
    addAttributs && categoryAttr
      ? attributeService.getAttributesByCategory(userNode, categoryAttr)
      : Promise.resolve(undefined);

  if (addOrganizations && groupNodes) {
    const organizationNodes = await Promise.all(
      groupNodes.map(async (group) => {
        const orgs = await getOrganizationFromSpinalUserGroup(group);
        return { orgs, group };
      })
    );

    const orgIdSeen = new Set<number>();
    for (const orgNodes of organizationNodes) {
      for (const orgNode of orgNodes.orgs) {
        if (!orgIdSeen.has(orgNode._server_id!)) {
          orgIdSeen.add(orgNode._server_id!);
          userData.organizations = userData.organizations || [];
          const data: any = createBasicNode(orgNode, ['color']);
          data.userGroupId = orgNodes.group._server_id!;
          userData.organizations.push(data);
        }
      }
    }
  }

  const attributeData = await attributeDataProm;
  if (attributeData) {
    userData.attributes = {} as Record<string, any>;
    for (const [key, attr] of Object.entries(attributeData)) {
      userData.attributes[key] = (<any>attr)?.value.get();
    }
  }

  if (groupNodes) {
    userData.groups = groupNodes.map((group) => createBasicNode(group));
  }

  return userData;
}
