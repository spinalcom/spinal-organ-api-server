/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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

import {
  GEOGRAPHIC_TYPES_ORDER,
  CONTEXT_TYPE,
  SITE_TYPE,
  BUILDING_TYPE,
  FLOOR_TYPE,
  ZONE_TYPE,
  ROOM_TYPE,
  REFERENCE_TYPE,
  EQUIPMENT_TYPE,
  SITE_RELATION,
  BUILDING_RELATION,
  FLOOR_RELATION,
  ZONE_RELATION,
  ROOM_RELATION,
  EQUIPMENT_RELATION,
  REFERENCE_RELATION,
} from 'spinal-env-viewer-context-geographic-service/build/constants';
import {
  TRelationMap,
  visitNodesWithTypeRelation,
} from '../../utilities/visitNodesWithTypeRelation';
import { ISpinalAPIMiddleware } from '../../interfaces';
import { SpinalNode } from 'spinal-model-graph';

const all_GeoType: string[] = GEOGRAPHIC_TYPES_ORDER.concat(CONTEXT_TYPE);
/**
 * @interface IViewInfoBody
 */
export interface IViewInfoBody {
  /**
   * node root of the request
   * @type {(number[] | number)}
   * @memberof IViewInfoBody
   */
  dynamicId?: number | number[];

  /**
   * get infos from the floors references : floors, walls, windows, doors...
   * Default to false
   * @type {boolean}
   * @memberof IViewInfoBody
   */
  floorRef?: boolean;
  /**
   * get infos from the rooms references : floor(s)
   * Default to true
   * @type {boolean}
   * @memberof IViewInfoBody
   */
  roomRef?: boolean;
  /**
   * get infos from the equipements
   * Default to false
   * @type {boolean}
   * @memberof IViewInfoBody
   */
  equipements?: boolean;
}
export interface IViewInfoRes {
  dynamicId: number;
  data: IViewInfoItemRes[];
}

interface IViewInfoItemRes {
  bimFileId: string;
  dbIds: number[];
  dynamicIds: number[];
}
interface IViewInfoTmpRes {
  bimFileId: string;
  dbIds: Array<number>;
  dynamicIds: Array<number>;
}

enum EError {
  BAD_REQ_NO_DYN_ID,
  BAD_REQ_BAD_DYN_ID,
  NO_CONTEXT_GEO_FOUND,
}
function createErrorObj(
  code: number,
  message: string
): { code: number; message: string } {
  return { code, message };
}

type ErrorsRecord = { [Error in EError]: ReturnType<typeof createErrorObj> };
const ErrorsRecord: ErrorsRecord = {
  [EError.BAD_REQ_NO_DYN_ID]: createErrorObj(
    400,
    'no dynamicId found in body request'
  ),
  [EError.BAD_REQ_BAD_DYN_ID]: createErrorObj(
    400,
    'bad dynamicIds in body request'
  ),
  [EError.NO_CONTEXT_GEO_FOUND]: createErrorObj(
    500,
    'no Spatial context found'
  ),
};

export async function viewInfo_func(
  spinalAPIMiddleware: ISpinalAPIMiddleware,
  profilId: string,
  options: IViewInfoBody | object = {},
  progressCallBack: (totalVisited: number) => void = () => {
    /* do nothing */
  }
): Promise<
  | {
      code: number;
      dataType: 'text';
      data: string;
    }
  | {
      code: number;
      dataType: 'json';
      data: any;
    }
> {
  if (!(options as IViewInfoBody).dynamicId) {
    //get dynamicId of building
    const graph = await spinalAPIMiddleware.getProfileGraph(profilId);
    const contexts = await graph.getChildren('hasContext');
    const geographicContexts = contexts.filter(
      (el) => el.getType().get() === 'geographicContext'
    );
    const buildings = await geographicContexts[0].getChildren(
      'hasGeographicBuilding'
    );
    const building = buildings[0];
    (options as IViewInfoBody).dynamicId = building._server_id;
    (options as IViewInfoBody).floorRef = true;
    (options as IViewInfoBody).roomRef = true;
    (options as IViewInfoBody).equipements = true;
  }
  try {
    const opts = options as Required<IViewInfoBody>;
    // getRootNode
    const nodes = await getRootNodes(
      opts.dynamicId,
      profilId,
      spinalAPIMiddleware
    );
    if (nodes.length === 0) return errorHandler(EError.BAD_REQ_BAD_DYN_ID);

    // getRelationListFromOption
    const relations = getRelationListFromOption(opts);
    // visitChildren
    const resBody: IViewInfoRes[] = [];
    let totalVisited = 0;
    const intervalId = setInterval(() => {
      progressCallBack(totalVisited);
    }, 5000);
    try {
      for (const node of nodes) {
        const item: IViewInfoTmpRes[] = [];
        for await (const n of visitNodesWithTypeRelation(node, relations)) {
          totalVisited++;
          if (
            n.info.type.get() === REFERENCE_TYPE ||
            n.info.type.get() === EQUIPMENT_TYPE
          ) {
            const bimFileId = n.info.bimFileId.get();
            const dbId = n.info.dbid.get();
            const dynamicId = n._server_id;
            if (bimFileId && dbId)
              pushResBody(item, bimFileId, dbId, dynamicId);
          }
        }
        resBody.push({
          dynamicId: node._server_id,
          data: item.map((it: IViewInfoTmpRes): IViewInfoItemRes => {
            return {
              bimFileId: it.bimFileId,
              dbIds: Array.from(it.dbIds),
              dynamicIds: Array.from(it.dynamicIds),
            };
          }),
        });
      }
    } finally {
      progressCallBack(totalVisited);
      clearInterval(intervalId);
    }
    const sizeRes = Array.isArray(opts.dynamicId) ? opts.dynamicId.length : 1;
    return {
      code: resBody.length === sizeRes ? 200 : 206,
      dataType: 'json',
      data: resBody,
    };
  } catch (e) {
    return { code: 500, dataType: 'text', data: e.message };
  }
}

function errorHandler(error: EError) {
  const e = ErrorsRecord[error];
  // res.status(e.code).send(e.message);
  return { code: e.code, dataType: 'text' as const, data: e.message };
}

async function getRootNodes(
  dynIds: number | number[],
  profileId: string,
  spinalAPIMiddleware: ISpinalAPIMiddleware
): Promise<SpinalNode[]> {
  const ids = Array.isArray(dynIds) ? dynIds : [dynIds];
  const proms = ids.map((dynId) => {
    return { dynId, prom: spinalAPIMiddleware.load(dynId, profileId) };
  });
  const result: SpinalNode[] = [];
  for (const prom of proms) {
    try {
      const d = await prom.prom;
      if (d instanceof SpinalNode && all_GeoType.includes(d.info.type.get())) {
        result.push(d);
      }
    } catch (e) {
      console.error(`Error load, dynId = ${prom.dynId}`);
    }
  }
  return result;
}

function getRelationListFromOption(
  options: Required<IViewInfoBody>
): TRelationMap {
  const baseRelation: string[] = [
    SITE_RELATION,
    BUILDING_RELATION,
    FLOOR_RELATION,
    ZONE_RELATION,
    ROOM_RELATION,
  ];
  const floor = options.floorRef
    ? baseRelation.concat([REFERENCE_RELATION])
    : baseRelation;
  const room = baseRelation.concat();
  if (options.roomRef) room.push(`${REFERENCE_RELATION}.ROOM`);
  if (options.equipements) room.push(EQUIPMENT_RELATION);
  return {
    [CONTEXT_TYPE]: baseRelation,
    [SITE_TYPE]: baseRelation,
    [BUILDING_TYPE]: baseRelation,
    [FLOOR_TYPE]: floor,
    [ZONE_TYPE]: baseRelation,
    [ROOM_TYPE]: room,
  };
}
function pushResBody(
  resBody: IViewInfoTmpRes[],
  bimFileId: string,
  dbId: number,
  dynamicId: number
): void {
  let found = false;
  if (dbId === -1) return;
  for (const item of resBody) {
    if (item.bimFileId === bimFileId) {
      found = true;
      item.dbIds.push(dbId);
      item.dynamicIds.push(dynamicId);
      break;
    }
  }
  if (found === false) {
    resBody.push({
      bimFileId,
      dbIds: [dbId],
      dynamicIds: [dynamicId],
    });
  }
}
