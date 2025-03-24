import { ISpinalAPIMiddleware } from '../interfaces';
import {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';

import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';



async function getRoomInventory(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  groupContext : SpinalNode<any>,
  dynamicId: number,
  reqInfo: { context: string, category : string , includePosition?: boolean, onlyDynamicId?: boolean }
  ) {

    const room: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
    //@ts-ignore
    SpinalGraphService._addNode(room);
    if (room.getType().get() !== "geographicRoom") {
        throw new Error("node is not of type geographicRoom");
    }

    const mapAdditionalInfo = new Map();

    if(groupContext.getType().get() !== 'BIMObjectGroupContext'){
        throw new Error("groupContext is not of type BIMObjectGroupContext");
    }    

    const equipmentList : any[] =  await room.getChildren("hasBimObject");
   
    

    const classifiedItems =  await classifyItemsByGroup(equipmentList, groupContext, reqInfo , mapAdditionalInfo);
    return classifiedItems;
}

async function getFloorInventory(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  groupContext : SpinalNode<any>,
  dynamicId: number,
  reqInfo: { context: string, category : string , includePosition?: boolean, includeArea?: boolean, onlyDynamicId?: boolean }
  ) {

    const floor: SpinalNode<any> = await spinalAPIMiddleware.load(dynamicId,profileId);
    //@ts-ignore
    SpinalGraphService._addNode(floor);
    if (floor.getType().get() !== "geographicFloor") {
        throw new Error("node is not of type geographicFloor");
    }

    const mapAdditionalInfo = new Map();

    const rooms = await floor.getChildren("hasGeographicRoom");

    if(groupContext.getType().get() === 'geographicRoomGroupContext'){
        reqInfo.includePosition = false; // safety check
        return await classifyItemsByGroup(rooms, groupContext, reqInfo , mapAdditionalInfo);
    }

    reqInfo.includeArea = false; // safety check

    

    const equipmentList : any[] = [];

    for(const room of rooms){
        const equipments = await room.getChildren("hasBimObject");
        for(const equipment of equipments){
            const additionalInfo = {};
            additionalInfo['room'] = {
                dynamicId: room._server_id,
                name: room.getName().get()
            };
            mapAdditionalInfo.set(equipment._server_id,additionalInfo);
        }
        equipmentList.push(...equipments)
   
    }

    const classifiedItems =  await classifyItemsByGroup(equipmentList, groupContext, reqInfo , mapAdditionalInfo);
    return classifiedItems;

}

async function cleanEmptyParentRelations(node : SpinalNode<any>){
    const par =  node.parents['groupHasBIMObject'];
    for ( const pointeur of par ) {     
        try {         
        await (await pointeur.ptr.load()).parent.ptr.load()     
        }     
        
        catch(e) {
                  node._removeParent(pointeur)
         } }    
        console.log("** Done **")
}

async function classifyItemsByGroup(itemList : SpinalNode<any>[], groupContext : SpinalNode<any>, reqInfo : any, mapAdditionalInfo){
    const res=[];
    for( const item of itemList){
        const parentGroups = groupContext.getType().get() === 'geographicRoomGroupContext' ? await item.getParents("groupHasgeographicRoom") : await item.getParents("groupHasBIMObject");

        for ( const parentGroup of parentGroups) {
            if(!parentGroup.belongsToContext(groupContext)){ // if the group does not belong to the context skip
                continue;
            }
            const parentCategories = await parentGroup.getParents("hasGroup")
            const parentCategory = parentCategories.find(e => e.getName().get() === reqInfo.category);
            if(!parentCategory) continue; // if the category is not the one user requested, skip
            if(!res.find(e=> e.name === parentGroup.getName().get())){
                res.push({
                    name: parentGroup.getName().get(),
                    dynamicId: parentGroup._server_id,
                    type: parentGroup.getType().get(),
                    color : parentGroup.info.color?.get(),
                    icon : parentGroup.info.icon?.get(),
                    groupItems: []
                })
            }
            const group = res.find(e => e.name === parentGroup.getName().get());
            const additionalInfo = mapAdditionalInfo.get(item._server_id);
            const position = reqInfo.includePosition ? await getCoordinate(item) : undefined;
            const area = reqInfo.includeArea ? await getArea(item) : undefined;
            group.groupItems.push({
                ...getDetail(item,reqInfo),
                ...additionalInfo,
                position,
                area
            });
            

        }
    }

    return res;
}

async function getCoordinate(equipment : SpinalNode<any>){
    const coordinate = await serviceDocumentation.findOneAttributeInCategory(equipment, 'Spatial','XYZ center')
    if(coordinate === -1) return { x: null, y: null, z :null};

    const [x, y, z] = (coordinate.value.get()as string).split(';').map(Number);
    return { x, y, z };
            
}

function getDetail(obj : SpinalNode<any>, reqInfo? : any){
    const infoObject = {
        staticId: reqInfo.onlyDynamicId ? undefined : obj.getId().get(),
        dynamicId: obj._server_id,
        name: reqInfo.onlyDynamicId ? undefined : obj.getName().get(),
        type:  reqInfo.onlyDynamicId ? undefined :obj.getType().get(),
        dbid :  reqInfo.onlyDynamicId ? undefined :obj.info.dbid?.get(),
        bimFileId:  reqInfo.onlyDynamicId ? undefined :obj.info.bimFileId?.get(),
        color:  reqInfo.onlyDynamicId ? undefined :obj.info.color?.get()
    };
    return infoObject;
}

async function getArea(room : SpinalNode<any>){
    const areaAttribute = await serviceDocumentation.findOneAttributeInCategory(room, 'Spatial','area')
    if(areaAttribute === -1) return null;

    const area = areaAttribute.value.get();
    return area;
}

export { getFloorInventory , getRoomInventory };
