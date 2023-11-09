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

async function getEquipmentStaticDetailsInfo(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profileId: string,
  equipementId: number
) {
  var equipment: SpinalNode<any> = await spinalAPIMiddleware.load(
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
      getGroupParent(equipment),
    ]);

    var revitCategory: string = '';
    var revitFamily: string = '';
    var revitType: string = '';
    var categories_bimObjects = await equipment.getChildren(
      NODE_TO_CATEGORY_RELATION
    );
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
    var info = {
      dynamicId: equipment._server_id,
      staticId: equipment.getId().get(),
      name: equipment.getName().get(),
      type: equipment.getType().get(),
      bimFileId: equipment.info.bimFileId.get(),
      version: equipment.info.version.get(),
      externalId: equipment.info.externalId.get(),
      dbid: equipment.info.dbid.get(),
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

async function getGroupParent(node: SpinalNode<any>): Promise<INodeInfo[]> {
  let parents = await SpinalGraphService.getParents(node.getId().get(), [
    'hasBimObject',
    'groupHasBIMObject',
  ]);

  var groupParents: INodeInfo[] = [];
  for (const parent of parents) {
    if (!(parent.type.get() === 'RoomContext')) {
      let realNode = SpinalGraphService.getRealNode(parent.id.get());
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

async function getAttributes(room: SpinalNode<any>): Promise<IAttr[]> {
  try {
    let categories = await room.getChildren(NODE_TO_CATEGORY_RELATION);
    const promises = categories.map(async (child): Promise<IAttr> => {
      let attributs = await child.element.load();
      return {
        dynamicId: child._server_id,
        staticId: child.getId().get(),
        name: child.getName().get(),
        type: child.getType().get(),
        attributs: attributs.get(),
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
async function getNodeControlEndpoints(
  node: SpinalNode<any>
): Promise<INodeControlEndpoint[]> {
  var profils = await SpinalGraphService.getChildren(node.getId().get(), [
    spinalControlPointService.ROOM_TO_CONTROL_GROUP,
  ]);
  var promises = profils.map(async (profile) => {
    var result = await SpinalGraphService.getChildren(profile.id.get(), [
      SpinalBmsEndpoint.relationName,
    ]);
    var endpoints = await result.map(async (endpoint) => {
      var realNode = SpinalGraphService.getRealNode(endpoint.id.get());
      var element = await endpoint.element.load();
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

export { getEquipmentStaticDetailsInfo };
export default getEquipmentStaticDetailsInfo;
