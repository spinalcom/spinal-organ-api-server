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

import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
import type SpinalAPIMiddleware from 'src/spinalAPIMiddleware';
import * as express from 'express';
import { Room } from '../interfacesGeoContext';
import {
  SpinalNode,
  SpinalGraphService,
  SpinalContext,
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

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
    
  /**
 * @swagger
 * /api/v1/room/read_static_details_multiple:
 *   post:
 *     security:
 *       - OauthSecurity:
 *         - readOnly
 *     description: Read static details of multiple rooms
 *     summary: Gets static details of multiple rooms
 *     tags:
 *       - Geographic Context
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: integer
 *               format: int64
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StaticDetailsRoom'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
  app.post('/api/v1/room/read_static_details_multiple', async (req, res, next) => {
    const dynamicIds: number[] = req.body;

    if (!Array.isArray(dynamicIds)) {
        return res.status(400).send('Expected an array of dynamic IDs');
    }

    // Map each dynamicId to a promise
    const promises = dynamicIds.map(dynamicId => getReadStaticDetailsInfo(dynamicId, spinalAPIMiddleware));

    const settledResults = await Promise.allSettled(promises);

    const finalResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            console.error(`Error with dynamicId ${dynamicIds[index]}: ${result.reason}`);
            return { dynamicId: dynamicIds[index], ...{} }; // Return the dynamicId with an empty object
        }
    });

    return res.json(finalResults);
});

};


async function getReadStaticDetailsInfo(roomId:number, spinalAPIMiddleware: SpinalAPIMiddleware){
  var room: SpinalNode<any> = await spinalAPIMiddleware.load(
    roomId
  );
  //@ts-ignore
  SpinalGraphService._addNode(room);
  if (room.getType().get() === 'geographicRoom') {
    const [
      allNodesControlesEndpoints,
      equipements,
      CategorieAttributsList,
      groupParents,
    ] = await Promise.all([
      getNodeControlEndpoints(room),
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
      bimObjects: equipements,
      groupParents: groupParents,
    };
    return info;
  } else {
    throw('node is not of type geographic room');
  }
}

async function getRoomParent(room: SpinalNode<any>): Promise<INodeInfo[]> {
  let parents = await SpinalGraphService.getParents(room.getId().get(), [
    'hasGeographicRoom',
    'groupHasgeographicRoom',
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

async function getRoomAttributes(room: SpinalNode<any>): Promise<IRoomAttr[]> {
  let categories = await room.getChildren(NODE_TO_CATEGORY_RELATION);
  const promises = categories.map(async (child): Promise<IRoomAttr> => {
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
}

async function getRoomBimObject(
  room: SpinalNode<any>
): Promise<IEquipmentInfo[]> {
  // const equipements: IEquipmentInfo[] = [];
  var bimObjects = await room.getChildren('hasBimObject');
  var revitCategory: string = '';
  var revitFamily: string = '';
  var revitType: string = '';

  const promises = bimObjects.map(async (child): Promise<IEquipmentInfo> => {
    // attributs BIMObject
    var categories_bimObjects = await child.getChildren(
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

async function getNodeControlEndpoints(
  room: SpinalNode<any>
): Promise<INodeControlEndpoint[]> {
  var profils = await SpinalGraphService.getChildren(room.getId().get(), [
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
