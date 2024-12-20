"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuildingStaticDetailsInfo = exports.getFloorStaticDetailsInfo = exports.getRoomStaticDetailsInfo = exports.getEquipmentStaticDetailsInfo = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const spinal_env_viewer_plugin_control_endpoint_service_1 = require("spinal-env-viewer-plugin-control-endpoint-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const ENDPOINT_RELATIONS = [
    'hasBmsEndpoint',
    'hasBmsDevice',
    'hasBmsEndpointGroup',
    'hasEndPoint',
];
async function getBuildingStaticDetailsInfo(spinalAPIMiddleware, profileId, buildingId) {
    const building = await spinalAPIMiddleware.load(buildingId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(building);
    if (building.getType().get() === 'geographicBuilding') {
        const [allNodesControlesEndpoints, allEndpoints, CategorieAttributsList,] = await Promise.all([
            getNodeControlEndpoints(building),
            getEndpointsInfo(building),
            getAttributes(building),
        ]);
        const info = {
            dynamicId: building._server_id,
            staticId: building.getId().get(),
            name: building.getName().get(),
            type: building.getType().get(),
            attributsList: CategorieAttributsList,
            controlEndpoint: allNodesControlesEndpoints,
            endpoints: allEndpoints
        };
        return info;
    }
    else {
        throw 'node is not of type geographic floor';
    }
}
exports.getBuildingStaticDetailsInfo = getBuildingStaticDetailsInfo;
async function getEquipmentStaticDetailsInfo(spinalAPIMiddleware, profileId, equipementId) {
    const equipment = await spinalAPIMiddleware.load(equipementId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(equipment);
    if (equipment.getType().get() === 'BIMObject') {
        const [allNodesControlesEndpoints, allEndpoints, CategorieAttributsList, groupParents,] = await Promise.all([
            getNodeControlEndpoints(equipment),
            getEndpointsInfo(equipment),
            getAttributes(equipment),
            getEquipmentGroupParent(equipment),
        ]);
        let revitCategory = '';
        const revitFamily = '';
        const revitType = '';
        const categories_bimObjects = await equipment.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
        for (const categorie of categories_bimObjects) {
            if (categorie.getName().get() === 'default') {
                const attributs_bimObjects = (await categorie.element.load()).get();
                for (const child of attributs_bimObjects) {
                    if (child.label === 'revit_category') {
                        revitCategory = child.value;
                        break;
                    }
                }
            }
        }
        const info = {
            dynamicId: equipment._server_id,
            staticId: equipment.getId().get(),
            name: equipment.getName().get(),
            type: equipment.getType().get(),
            bimFileId: equipment.info.bimFileId?.get(),
            version: equipment.info.version?.get(),
            externalId: equipment.info.externalId?.get(),
            dbid: equipment.info.dbid?.get(),
            default_attributs: {
                revitCategory: revitCategory,
                revitFamily: revitFamily,
                revitType: revitType,
            },
            attributsList: CategorieAttributsList,
            controlEndpoint: allNodesControlesEndpoints,
            endpoints: allEndpoints,
            groupParents: groupParents,
        };
        return info;
    }
    else {
        throw 'node is not of type BIMObject';
    }
}
exports.getEquipmentStaticDetailsInfo = getEquipmentStaticDetailsInfo;
async function getFloorStaticDetailsInfo(spinalAPIMiddleware, profileId, floorId) {
    const floor = await spinalAPIMiddleware.load(floorId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(floor);
    if (floor.getType().get() === 'geographicFloor') {
        const [allNodesControlesEndpoints, allEndpoints, CategorieAttributsList,] = await Promise.all([
            getNodeControlEndpoints(floor),
            getEndpointsInfo(floor),
            getAttributes(floor),
        ]);
        const info = {
            dynamicId: floor._server_id,
            staticId: floor.getId().get(),
            name: floor.getName().get(),
            type: floor.getType().get(),
            attributsList: CategorieAttributsList,
            controlEndpoint: allNodesControlesEndpoints,
            endpoints: allEndpoints
        };
        return info;
    }
    else {
        throw 'node is not of type geographic floor';
    }
}
exports.getFloorStaticDetailsInfo = getFloorStaticDetailsInfo;
async function getRoomStaticDetailsInfo(spinalAPIMiddleware, profileId, roomId) {
    const room = await spinalAPIMiddleware.load(roomId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
    if (room.getType().get() === 'geographicRoom') {
        const [allNodesControlesEndpoints, allEndpoints, equipements, CategorieAttributsList, groupParents,] = await Promise.all([
            getNodeControlEndpoints(room),
            getEndpointsInfo(room),
            getRoomBimObject(room),
            getAttributes(room),
            getRoomParent(room),
        ]);
        const info = {
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
    //console.log("room",room);
    const parents = await room.getParents([
        'hasGeographicRoom',
        'groupHasgeographicRoom',
    ]);
    const groupParents = [];
    for (const parent of parents) {
        if (!(parent.info.type.get() === 'RoomContext')) {
            const info = {
                dynamicId: parent._server_id,
                staticId: parent.info.id.get(),
                name: parent.info.name.get(),
                type: parent.info.type.get(),
            };
            groupParents.push(info);
        }
    }
    return groupParents;
}
async function getEquipmentGroupParent(node) {
    const parents = await spinal_env_viewer_graph_service_1.SpinalGraphService.getParents(node.getId().get(), [
        'hasBimObject',
        'groupHasBIMObject',
    ]);
    const groupParents = [];
    for (const parent of parents) {
        if (!(parent.type.get() === 'RoomContext')) {
            const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(parent.id.get());
            const info = {
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
async function getAttributes(room) {
    try {
        const categories = await room.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
        const promises = categories.map(async (child) => {
            const attributs = await child.element.load();
            const attributes = [];
            for (const attribute of attributs) {
                attributes.push({
                    dynamicId: attribute._server_id,
                    label: attribute.label.get(),
                    value: attribute.value.get(),
                    date: attribute.date.get(),
                    type: attribute.type.get(),
                    unit: attribute.unit.get(),
                });
            }
            return {
                dynamicId: child._server_id,
                staticId: child.getId().get(),
                name: child.getName().get(),
                type: child.getType().get(),
                attributs: attributes,
            };
        });
        return Promise.all(promises);
    }
    catch (error) {
        console.error('Failed to get attributes for node :', room.getName().get(), ' ', error);
        return [];
    }
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
        const element = await el.element.load();
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
async function getNodeControlEndpoints(node) {
    const profils = await node.getChildren([
        spinal_env_viewer_plugin_control_endpoint_service_1.spinalControlPointService.ROOM_TO_CONTROL_GROUP,
    ]);
    const promises = profils.map(async (profile) => {
        const result = await profile.getChildren([
            spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName,
        ]);
        const endpoints = await result.map(async (endpoint) => {
            const element = await endpoint.element.load();
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
                dynamicId: endpoint._server_id,
                staticId: endpoint.info.id.get(),
                name: element.name.get(),
                unit: element.unit?.get(),
                value: element.currentValue?.get(),
                category: category,
            };
        });
        return {
            profileName: profile.info.name.get(),
            endpoints: await Promise.all(endpoints),
        };
    });
    return Promise.all(promises);
}
async function getRoomBimObject(room) {
    // const equipements: IEquipmentInfo[] = [];
    const bimObjects = await room.getChildren('hasBimObject');
    let revitCategory = '';
    const revitFamily = '';
    const revitType = '';
    const promises = bimObjects.map(async (child) => {
        // attributs BIMObject
        const categories_bimObjects = await child.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
        for (const categorie of categories_bimObjects) {
            if (categorie.getName().get() === 'default') {
                const attributs_bimObjects = (await categorie.element.load()).get();
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
            bimFileId: child.info.bimFileId?.get(),
            version: child.info.version?.get(),
            externalId: child.info.externalId?.get(),
            dbid: child.info.dbid?.get(),
            default_attributs: {
                revitCategory: revitCategory,
                revitFamily: revitFamily,
                revitType: revitType,
            },
        };
    });
    return Promise.all(promises);
}
//# sourceMappingURL=getStaticDetailsInfo.js.map