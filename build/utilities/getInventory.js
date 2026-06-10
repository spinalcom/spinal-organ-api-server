"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuildingInventory = getBuildingInventory;
exports.getFloorInventory = getFloorInventory;
exports.getRoomInventory = getRoomInventory;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
function parseOptionalId(value) {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
        return Number(value);
    return undefined;
}
function parseOptionalIds(values) {
    if (!Array.isArray(values))
        return undefined;
    const ids = values.map(parseOptionalId).filter((id) => id !== undefined);
    return ids.length > 0 ? ids : undefined;
}
async function getRoomInventory(spinalAPIMiddleware, profileId, groupContext, dynamicId, reqInfo) {
    const room = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(room);
    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographicRoom");
    }
    const mapAdditionalInfo = new Map();
    if (groupContext.getType().get() !== 'BIMObjectGroupContext') {
        throw new Error("groupContext is not of type BIMObjectGroupContext");
    }
    const equipmentList = await room.getChildren("hasBimObject");
    const classifiedItems = await classifyItemsByGroup(equipmentList, groupContext, reqInfo, mapAdditionalInfo);
    return classifiedItems;
}
async function getBuildingInventory(spinalAPIMiddleware, profileId, groupContext, dynamicId, reqInfo) {
    const building = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(building);
    if (building.getType().get() !== "geographicBuilding") {
        throw new Error("node is not of type geographicBuilding");
    }
    // For building its faster to classify by the group context directly without going through floors and rooms
    return await classifyItemsByContext(groupContext, reqInfo);
}
async function classifyItemsByContext(groupContext, reqInfo) {
    const groupIds = parseOptionalIds(reqInfo.groupIds);
    const categoryId = parseOptionalId(reqInfo.categoryId);
    const isRoomContext = groupContext.getType().get() === 'geographicRoomGroupContext';
    const groupToItemRelation = isRoomContext ? "groupHasgeographicRoom" : "groupHasBIMObject";
    if (!isRoomContext) {
        reqInfo.includeArea = false; // safety check, area is only relevant for rooms
    }
    const res = [];
    let categories = await groupContext.getChildren("hasCategory");
    if (categoryId !== undefined) {
        categories = categories.filter(e => e._server_id === categoryId);
    }
    else if (reqInfo.category) {
        categories = categories.filter(e => e.getName().get() === reqInfo.category);
    }
    for (const category of categories) {
        let groups = await category.getChildren("hasGroup");
        if (groupIds && groupIds.length > 0) {
            groups = groups.filter(e => groupIds.includes(e._server_id));
        }
        else if (reqInfo.groups && reqInfo.groups.length > 0) {
            groups = groups.filter(e => reqInfo.groups.includes(e.getName().get()));
        }
        for (const group of groups) {
            const items = await group.getChildren(groupToItemRelation);
            const groupItems = [];
            for (const item of items) {
                const position = reqInfo.includePosition ? await getCoordinate(item) : undefined;
                const area = reqInfo.includeArea ? await getArea(item) : undefined;
                groupItems.push({
                    ...getDetail(item, reqInfo),
                    position,
                    area
                });
            }
            res.push({
                name: group.getName().get(),
                dynamicId: group._server_id,
                type: group.getType().get(),
                color: group.info.color?.get(),
                icon: group.info.icon?.get(),
                groupItems
            });
        }
    }
    return res;
}
async function getFloorInventory(spinalAPIMiddleware, profileId, groupContext, dynamicId, reqInfo) {
    const floor = await spinalAPIMiddleware.load(dynamicId, profileId);
    //@ts-ignore
    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(floor);
    if (floor.getType().get() !== "geographicFloor") {
        throw new Error("node is not of type geographicFloor");
    }
    const mapAdditionalInfo = new Map();
    const rooms = await floor.getChildren("hasGeographicRoom");
    if (groupContext.getType().get() === 'geographicRoomGroupContext') {
        return await classifyItemsByGroup(rooms, groupContext, reqInfo, mapAdditionalInfo);
    }
    reqInfo.includeArea = false; // safety check , area is only relevant for rooms
    const equipmentList = [];
    for (const room of rooms) {
        const equipments = await room.getChildren("hasBimObject");
        for (const equipment of equipments) {
            const additionalInfo = {};
            additionalInfo['room'] = {
                dynamicId: room._server_id,
                name: room.getName().get()
            };
            mapAdditionalInfo.set(equipment._server_id, additionalInfo);
        }
        equipmentList.push(...equipments);
    }
    const classifiedItems = await classifyItemsByGroup(equipmentList, groupContext, reqInfo, mapAdditionalInfo);
    return classifiedItems;
}
async function cleanEmptyParentRelations(node) {
    const par = node.parents['groupHasBIMObject'];
    for (const pointeur of par) {
        try {
            await (await pointeur.ptr.load()).parent.ptr.load();
        }
        catch (e) {
            node._removeParent(pointeur);
        }
    }
    console.log("** Done **");
}
async function classifyItemsByGroup(itemList, groupContext, reqInfo, mapAdditionalInfo) {
    const groupIds = parseOptionalIds(reqInfo.groupIds);
    const categoryId = parseOptionalId(reqInfo.categoryId);
    const res = [];
    const assignedItemIds = new Set();
    for (const item of itemList) {
        let parentGroups = groupContext.getType().get() === 'geographicRoomGroupContext' ? await item.getParentsInContext(groupContext, "groupHasgeographicRoom") : await item.getParentsInContext(groupContext, "groupHasBIMObject");
        if (groupIds && groupIds.length > 0) {
            parentGroups = parentGroups.filter(e => groupIds.includes(e._server_id));
        }
        else if (reqInfo.groups && reqInfo.groups.length > 0) {
            parentGroups = parentGroups.filter(e => reqInfo.groups.includes(e.getName().get()));
        }
        for (const parentGroup of parentGroups) {
            const parentCategories = await parentGroup.getParentsInContext(groupContext, "hasGroup");
            const parentCategory = categoryId !== undefined
                ? parentCategories.find(e => e._server_id === categoryId)
                : parentCategories.find(e => e.getName().get() === reqInfo.category);
            if (!parentCategory)
                continue;
            assignedItemIds.add(item._server_id);
            if (!res.find(e => e.name === parentGroup.getName().get())) {
                res.push({
                    name: parentGroup.getName().get(),
                    dynamicId: parentGroup._server_id,
                    type: parentGroup.getType().get(),
                    color: parentGroup.info.color?.get(),
                    icon: parentGroup.info.icon?.get(),
                    groupItems: []
                });
            }
            const group = res.find(e => e.name === parentGroup.getName().get());
            const additionalInfo = mapAdditionalInfo.get(item._server_id);
            const position = reqInfo.includePosition ? await getCoordinate(item) : undefined;
            const area = reqInfo.includeArea ? await getArea(item) : undefined;
            group.groupItems.push({
                ...getDetail(item, reqInfo),
                ...additionalInfo,
                position,
                area
            });
        }
    }
    if (reqInfo.includeUnassignedItems) {
        const unassignedItems = [];
        for (const item of itemList) {
            if (!assignedItemIds.has(item._server_id)) {
                const additionalInfo = mapAdditionalInfo.get(item._server_id);
                const position = reqInfo.includePosition ? await getCoordinate(item) : undefined;
                const area = reqInfo.includeArea ? await getArea(item) : undefined;
                unassignedItems.push({
                    ...getDetail(item, reqInfo),
                    ...additionalInfo,
                    position,
                    area
                });
            }
        }
        if (unassignedItems.length > 0) {
            res.push({
                name: 'unassignedItems',
                groupItems: unassignedItems
            });
        }
    }
    return res;
}
async function getCoordinate(equipment) {
    const coordinate = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.findOneAttributeInCategory(equipment, 'Spatial', 'XYZ center');
    if (coordinate === -1)
        return { x: null, y: null, z: null };
    const [x, y, z] = coordinate.value.get().split(';').map(Number);
    return { x, y, z };
}
function getDetail(obj, reqInfo) {
    const infoObject = {
        staticId: reqInfo.onlyDynamicId ? undefined : obj.getId().get(),
        dynamicId: obj._server_id,
        name: reqInfo.onlyDynamicId ? undefined : obj.getName().get(),
        type: reqInfo.onlyDynamicId ? undefined : obj.getType().get(),
        dbid: reqInfo.onlyDynamicId ? undefined : obj.info.dbid?.get(),
        bimFileId: reqInfo.onlyDynamicId ? undefined : obj.info.bimFileId?.get(),
        color: reqInfo.onlyDynamicId ? undefined : obj.info.color?.get()
    };
    return infoObject;
}
async function getArea(room) {
    const areaAttribute = await spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.findOneAttributeInCategory(room, 'Spatial', 'area');
    if (areaAttribute === -1)
        return null;
    const area = areaAttribute.value.get();
    return area;
}
//# sourceMappingURL=getInventory.js.map