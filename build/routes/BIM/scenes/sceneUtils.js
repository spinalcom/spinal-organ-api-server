"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
exports.isNodeId = exports.getFolderPath = exports.sceneGetItems = exports.getScenes = void 0;
const SCENE_CONTEXT_NAME = 'Scenes';
const SCENE_RELATIONS = ['hasScene'];
const SCENE_PART_RELATIONS = ['hasParts'];
async function getScenes(spinalAPIMiddleware) {
    const graph = await spinalAPIMiddleware.getGraph();
    const scenesContext = await graph.getContext(SCENE_CONTEXT_NAME);
    return scenesContext.getChildren(SCENE_RELATIONS);
}
exports.getScenes = getScenes;
async function sceneGetItems(sceneNode, spinalAPIMiddleware) {
    const res = [];
    const parts = await sceneNode.getChildren(SCENE_PART_RELATIONS);
    const sceneId = sceneNode.getId().get();
    for (const part of parts) {
        const bimFile = {
            name: part.info.name.get(),
            dynamicId: part._server_id,
            staticId: part.getId().get(),
        };
        if (part.info.defaultItem) {
            bimFile.item = part.info.defaultItem
                .get()
                .replace('/html/viewerForgeFiles/', '');
        }
        else {
            // eslint-disable-next-line no-await-in-loop
            const element = await part.element.load();
            // eslint-disable-next-line no-await-in-loop
            const currVersion = await spinalAPIMiddleware.loadPtr(element.currentVersion);
            if (currVersion.aecPath) {
                const aec = currVersion.aecPath?.get();
                bimFile.aecPath = aec.replace('/html/viewerForgeFiles/', '');
            }
            if (currVersion.items) {
                for (let idx = 0; idx < currVersion.items.length; idx++) {
                    const path = currVersion.items[idx].path.get();
                    if (path.endsWith('.svf')) {
                        bimFile.item = path.replace('/html/viewerForgeFiles/', '');
                        break;
                    }
                }
            }
            if (currVersion.offset && currVersion.offset[sceneId]) {
                bimFile.offset = currVersion.offset[sceneId]?.get();
            }
        }
        res.push(bimFile);
    }
    return res;
}
exports.sceneGetItems = sceneGetItems;
function getFolderPath(itemPath) {
    console.log('itemPath', itemPath);
    return itemPath.split('/')[0];
}
exports.getFolderPath = getFolderPath;
function isNodeId(node, id) {
    // @ts-ignore
    if (isNaN(id))
        return id === node.info.id.get();
    return id == node._server_id;
}
exports.isNodeId = isNodeId;
//# sourceMappingURL=sceneUtils.js.map