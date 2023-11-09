"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomStaticDetailsInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const spinal_env_viewer_plugin_control_endpoint_service_1 = require("spinal-env-viewer-plugin-control-endpoint-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const ENDPOINT_RELATIONS = ['hasBmsEndpoint', 'hasBmsDevice', 'hasBmsEndpointGroup', 'hasEndPoint'];
async function getRoomStaticDetailsInfo(spinalAPIMiddleware, profileId, roomId) {
    var room = await spinalAPIMiddleware.load(roomId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
    if (room.getType().get() === 'geographicRoom') {
        const [allNodesControlesEndpoints, allEndpoints, equipements, CategorieAttributsList, groupParents,] = await Promise.all([
            getNodeControlEndpoints(room),
            getEndpointsInfo(room),
            getRoomBimObject(room),
            getRoomAttributes(room),
            getRoomParent(room),
        ]);
        var info = {
            dynamicId: room._server_id,
            staticId: room.getId().get(),
            name: room.getName().get(),
            type: room.getType().get(),
            attributsList: CategorieAttributsList,
            controlEndpoint: allNodesControlesEndpoints,
            endpoints: allEndpoints,
            bimObjects: equipements,
            groupParents: groupParents,
        };
        return info;
    }
    else {
        throw 'node is not of type geographic room';
    }
}
exports.getRoomStaticDetailsInfo = getRoomStaticDetailsInfo;
async function getRoomParent(room) {
    let parents = await spinal_env_viewer_graph_service_1.SpinalGraphService.getParents(room.getId().get(), [
        'hasGeographicRoom',
        'groupHasgeographicRoom',
    ]);
    var groupParents = [];
    for (const parent of parents) {
        if (!(parent.type.get() === 'RoomContext')) {
            let realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(parent.id.get());
            let info = {
                dynamicId: realNode._server_id,
                staticId: parent.id.get(),
                name: parent.name.get(),
                type: parent.type.get(),
            };
            groupParents.push(info);
        }
    }
    return groupParents;
}
async function getRoomAttributes(room) {
    try {
        let categories = await room.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
        const promises = categories.map(async (child) => {
            let attributs = await child.element.load();
            return {
                dynamicId: child._server_id,
                staticId: child.getId().get(),
                name: child.getName().get(),
                type: child.getType().get(),
                attributs: attributs?.get(),
            };
        });
        return Promise.all(promises);
    }
    catch (error) {
        console.error("Failed to get attributes for node :", room.getName().get(), " ", error);
        return [];
    }
}
async function getRoomBimObject(room) {
    // const equipements: IEquipmentInfo[] = [];
    var bimObjects = await room.getChildren('hasBimObject');
    var revitCategory = '';
    var revitFamily = '';
    var revitType = '';
    const promises = bimObjects.map(async (child) => {
        // attributs BIMObject
        var categories_bimObjects = await child.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
        for (const categorie of categories_bimObjects) {
            if (categorie.getName().get() === 'default') {
                var attributs_bimObjects = (await categorie.element.load()).get();
                for (const child of attributs_bimObjects) {
                    if (child.label === 'revit_category') {
                        revitCategory = child.value;
                        break;
                    }
                }
            }
        }
        return {
            dynamicId: child._server_id,
            staticId: child.getId().get(),
            name: child.getName().get(),
            type: child.getType().get(),
            bimFileId: child.info.bimFileId.get(),
            version: child.info.version.get(),
            externalId: child.info.externalId.get(),
            dbid: child.info.dbid.get(),
            default_attributs: {
                revitCategory: revitCategory,
                revitFamily: revitFamily,
                revitType: revitType,
            },
        };
    });
    return Promise.all(promises);
}
async function getEndpoints(node) {
    let res = [];
    const children = await node.getChildren(ENDPOINT_RELATIONS);
    for (const child of children) {
        if (child.info.type.get() === 'BmsEndpoint') {
            res.push(child);
        }
        else {
            res = res.concat(await getEndpoints(child));
        }
    }
    return res;
}
async function getEndpointsInfo(node) {
    const endpoints = await getEndpoints(node);
    const endpointsInfo = await endpoints.map(async (el) => {
        var element = await el.element.load();
        return {
            dynamicId: el._server_id,
            staticId: el.getId().get(),
            name: el.getName().get(),
            type: el.getType().get(),
            value: element.currentValue?.get(),
        };
    });
    return Promise.all(endpointsInfo);
}
async function getNodeControlEndpoints(room) {
    var profils = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(room.getId().get(), [
        spinal_env_viewer_plugin_control_endpoint_service_1.spinalControlPointService.ROOM_TO_CONTROL_GROUP,
    ]);
    var promises = profils.map(async (profile) => {
        var result = await spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(profile.id.get(), [
            spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName,
        ]);
        var endpoints = await result.map(async (endpoint) => {
            var realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(endpoint.id.get());
            var element = await endpoint.element.load();
            let category;
            if (element.type.get() === 'Temperature' ||
                element.type.get() === 'Hygrometry' ||
                element.type.get() === 'Power' ||
                element.type.get() === 'Occupation' ||
                element.type.get() === 'Light') {
                category = 'Measure';
            }
            else if (element.type.get() === 'Alarm') {
                category = 'Alarm';
            }
            else if (element.type.get() === 'Consigne') {
                category = 'Command';
            }
            else {
                category = 'Other';
            }
            // var currentValue = element.currentValue.get();
            return {
                dynamicId: realNode._server_id,
                staticId: endpoint.id.get(),
                name: element.name.get(),
                value: element.currentValue?.get(),
                category: category,
            };
        });
        return {
            profileName: profile.name.get(),
            endpoints: await Promise.all(endpoints),
        };
    });
    return Promise.all(promises);
}
exports.default = getRoomStaticDetailsInfo;
//# sourceMappingURL=getRoomStaticDetailsInfo.js.map