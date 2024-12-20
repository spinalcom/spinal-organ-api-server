import { ISpinalAPIMiddleware } from '../interfaces';
import {
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { NODE_TO_CATEGORY_RELATION } from 'spinal-env-viewer-plugin-documentation-service/dist/Models/constants';
import { spinalControlPointService } from 'spinal-env-viewer-plugin-control-endpoint-service';
import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';

interface IEquipmentInfo {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
  bimFileId: any;
  version: any;
  externalId: any;
  dbid: any;
  default_attributs: {
    revitCategory: string;
    revitFamily: string;
    revitType: string;
  };
}
interface IAttr {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
  attributs: any;
}

interface IRoomAttr {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
  attributs: any;
}
interface INodeControlEndpoint {
  profileName: any;
  endpoints: {
    dynamicId: number;
    staticId: any;
    name: any;
    category: string;
  }[];
}
interface INodeInfo {
  dynamicId: number;
  staticId: string;
  name: string;
  type: string;
}


const ENDPOINT_RELATIONS = [
  'hasBmsEndpoint',
  'hasBmsDevice',
  'hasBmsEndpointGroup',
  'hasEndPoint',
];


async function getBuildingStaticDetailsInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  buildingId: number,
) {
  const building: SpinalNode<any> = await spinalAPIMiddleware.load(buildingId,profileId);
  
  //@ts-ignore
  SpinalGraphService._addNode(building);
  if (building.getType().get() === 'geographicBuilding') {
    const [
      allNodesControlesEndpoints,
      allEndpoints,
      CategorieAttributsList,

    ] = await Promise.all([
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
  } else {
    throw 'node is not of type geographic floor';
  }
}
async function getEquipmentStaticDetailsInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  equipementId: number
) {
  const equipment: SpinalNode<any> = await spinalAPIMiddleware.load(
    equipementId,
    profileId
  );
  //@ts-ignore
  SpinalGraphService._addNode(equipment);
  if (equipment.getType().get() === 'BIMObject') {
    const [
      allNodesControlesEndpoints,
      allEndpoints,
      CategorieAttributsList,
      groupParents,
    ] = await Promise.all([
      getNodeControlEndpoints(equipment),
      getEndpointsInfo(equipment),
      getAttributes(equipment),
      getEquipmentGroupParent(equipment),
    ]);

    let revitCategory = '';
    const revitFamily = '';
    const revitType = '';
    const categories_bimObjects = await equipment.getChildren(
      NODE_TO_CATEGORY_RELATION
    );
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
  } else {
    throw 'node is not of type BIMObject';
  }
}

async function getFloorStaticDetailsInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  floorId: number,
) {
  const floor: SpinalNode<any> = await spinalAPIMiddleware.load(floorId,profileId);
  
  //@ts-ignore
  SpinalGraphService._addNode(floor);
  if (floor.getType().get() === 'geographicFloor') {
    const [
      allNodesControlesEndpoints,
      allEndpoints,
      CategorieAttributsList,

    ] = await Promise.all([
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
  } else {
    throw 'node is not of type geographic floor';
  }
}

async function getRoomStaticDetailsInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  roomId: number,
) {
  const room: SpinalNode<any> = await spinalAPIMiddleware.load(roomId,profileId);
  
  //@ts-ignore
  SpinalGraphService._addNode(room);
  if (room.getType().get() === 'geographicRoom') {
    const [
      allNodesControlesEndpoints,
      allEndpoints,
      equipements,
      CategorieAttributsList,
      groupParents,
    ] = await Promise.all([
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
  } else {
    throw 'node is not of type geographic room';
  }
}

async function getRoomParent(room: SpinalNode<any>): Promise<INodeInfo[]> {
  //console.log("room",room);
  const parents = await room.getParents( [
    'hasGeographicRoom',
    'groupHasgeographicRoom',
  ]);
  const groupParents: INodeInfo[] = [];
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

async function getEquipmentGroupParent(node: SpinalNode<any>): Promise<INodeInfo[]> {
  const parents = await SpinalGraphService.getParents(node.getId().get(), [
    'hasBimObject',
    'groupHasBIMObject',
  ]);

  const groupParents: INodeInfo[] = [];
  for (const parent of parents) {
    if (!(parent.type.get() === 'RoomContext')) {
      const realNode = SpinalGraphService.getRealNode(parent.id.get());
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

async function getAttributes(room: SpinalNode<any>): Promise<IAttr[]> {
  try {
    const categories = await room.getChildren(NODE_TO_CATEGORY_RELATION);
    const promises = categories.map(async (child): Promise<IAttr> => {
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
  } catch (error) {
    console.error(
      'Failed to get attributes for node :',
      room.getName().get(),
      ' ',
      error
    );
    return [];
  }
}

async function getEndpoints(node: SpinalNode<any>): Promise<SpinalNode<any>[]> {
  let res: SpinalNode<any>[] = [];
  const children = await node.getChildren(ENDPOINT_RELATIONS);
  for (const child of children) {
    if (child.info.type.get() === 'BmsEndpoint') {
      res.push(child);
    } else {
      res = res.concat(await getEndpoints(child));
    }
  }
  return res;
}

async function getEndpointsInfo(node: SpinalNode<any>) {
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

async function getNodeControlEndpoints(
  node: SpinalNode<any>
): Promise<INodeControlEndpoint[]> {
  const profils = await node.getChildren( [
    spinalControlPointService.ROOM_TO_CONTROL_GROUP,
  ]);
  const promises = profils.map(async (profile) => {
    const result = await profile.getChildren([
      SpinalBmsEndpoint.relationName,
    ]);
    const endpoints = await result.map(async (endpoint) => {
      
      const element = await endpoint.element.load();
      let category: string;
      if (
        element.type.get() === 'Temperature' ||
        element.type.get() === 'Hygrometry' ||
        element.type.get() === 'Power' ||
        element.type.get() === 'Occupation' ||
        element.type.get() === 'Light'
      ) {
        category = 'Measure';
      } else if (element.type.get() === 'Alarm') {
        category = 'Alarm';
      } else if (element.type.get() === 'Consigne') {
        category = 'Command';
      } else {
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

async function getRoomBimObject(
  room: SpinalNode<any>
): Promise<IEquipmentInfo[]> {
  // const equipements: IEquipmentInfo[] = [];
  const bimObjects = await room.getChildren('hasBimObject');
  let revitCategory = '';
  const revitFamily = '';
  const revitType = '';

  const promises = bimObjects.map(async (child): Promise<IEquipmentInfo> => {
    // attributs BIMObject
    const categories_bimObjects = await child.getChildren(
      NODE_TO_CATEGORY_RELATION
    );
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

export { getEquipmentStaticDetailsInfo };
export { getRoomStaticDetailsInfo };
export { getFloorStaticDetailsInfo };
export { getBuildingStaticDetailsInfo };

