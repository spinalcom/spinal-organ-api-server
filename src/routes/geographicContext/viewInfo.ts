/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import {
  SpinalNode,
  SpinalGraphService,
  SpinalContext,
} from 'spinal-env-viewer-graph-service';

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
import { getProfileId } from '../../utilities/requestUtilities';

const all_GeoType: string[] = GEOGRAPHIC_TYPES_ORDER.concat(CONTEXT_TYPE);
/**
 * @interface IViewInfoBody
 */
interface IViewInfoBody {
  /**
   * node root of the request
   * @type {(number[] | number)}
   * @memberof IViewInfoBody
   */
  dynamicId: number | number[];

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
interface IViewInfoRes {
  dynamicId: number;
  data: IViewInfoItemRes[];
}

interface IViewInfoItemRes {
  bimFileId: string;
  dbIds: number[];
}
interface IViewInfoTmpRes {
  bimFileId: string;
  dbIds: Set<number>;
}

type ViweInfoRes = express.Response<string | IViewInfoRes[], IViewInfoBody>;
type ViweInfoReq = express.Request<
  never,
  IViewInfoRes[] | string,
  IViewInfoBody
>;
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

function errorHandler(res: ViweInfoRes, error: EError) {
  const e = ErrorsRecord[error];
  res.status(e.code).send(e.message);
}

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  async function getRootNodes(
    dynIds: number | number[],
    profileId: string
  ): Promise<SpinalNode[]> {
    const ids = Array.isArray(dynIds) ? dynIds : [dynIds];
    const proms = ids.map((dynId) => {
      return { dynId, prom: spinalAPIMiddleware.load(dynId, profileId) };
    });
    const result: SpinalNode[] = [];
    for (const prom of proms) {
      try {
        const d = await prom.prom;
        if (
          d instanceof SpinalNode &&
          all_GeoType.includes(d.info.type.get())
        ) {
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
    dbId: number
  ): void {
    let found = false;
    for (const item of resBody) {
      if (item.bimFileId === bimFileId) {
        found = true;
        item.dbIds.add(dbId);
        break;
      }
    }
    if (found === false) {
      resBody.push({
        bimFileId,
        dbIds: new Set([dbId]),
      });
    }
  }

  /**
   * @swagger
   * /api/v1/geographicContext/viewInfo:
   *   post:
   *     security:
   *       - bearerAuth:
   *         - read
   *     description: Fetches view information based on the geographical context for specified IDs and options
   *     summary: Fetch view information for geographical context
   *     tags:
   *       - Geographic Context
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - dynamicId
   *             properties:
   *               dynamicId:
   *                 type: integer
   *                 format: int64
   *                 description: Unique identifier for the node
   *               floorRef:
   *                 type: boolean
   *                 description: Flag to include floor reference, defaults to false
   *               roomRef:
   *                 type: boolean
   *                 description: Flag to include room reference, defaults to true
   *               equipements:
   *                 type: boolean
   *                 description: Flag to include equipment details, defaults to false
   *     responses:
   *       200:
   *         description: Successfully retrieved view information
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   dynamicId:
   *                     type: integer
   *                     format: int64
   *                     description: Server ID of the node
   *                   data:
   *                     type: array
   *                     items:
   *                       type: object
   *                       properties:
   *                         bimFileId:
   *                           type: string
   *                           description: Identifier for the BIM file
   *                         dbIds:
   *                           type: array
   *                           items:
   *                             type: string
   *                           description: Database IDs associated with the node
   *       206:
   *         description: Some retrieved informations were not found and are omitted from the response, content type same as 200
   *       400:
   *         description: Bad request, typically missing required 'dynamicId'
   */
  app.post(
    '/api/v1/geographicContext/viewInfo',
    async (req: ViweInfoReq, res: ViweInfoRes): Promise<any> => {
      const body = req.body;
      const profilId = getProfileId(req);
      const options: Required<IViewInfoBody> = {
        dynamicId: body.dynamicId,
        floorRef: body.floorRef || false,
        roomRef: body.roomRef || true,
        equipements: body.equipements || false,
      };

      if (!options.dynamicId) {
        return errorHandler(res, EError.BAD_REQ_NO_DYN_ID);
      }
      // getRootNode
      try {
        const nodes = await getRootNodes(options.dynamicId, profilId);
        if (nodes.length === 0)
          return errorHandler(res, EError.BAD_REQ_BAD_DYN_ID);

        // getRelationListFromOption
        const relations = getRelationListFromOption(options);
        // visitChildren
        const resBody: IViewInfoRes[] = [];
        for (const node of nodes) {
          const item: IViewInfoTmpRes[] = [];
          for await (const n of visitNodesWithTypeRelation(node, relations)) {
            if (
              n.info.type.get() === REFERENCE_TYPE ||
              n.info.type.get() === EQUIPMENT_TYPE
            ) {
              const bimFileId = n.info.bimFileId.get();
              const dbId = n.info.dbid.get();
              if (bimFileId && dbId) pushResBody(item, bimFileId, dbId);
            }
          }
          resBody.push({
            dynamicId: node._server_id,
            data: item.map((it: IViewInfoTmpRes): IViewInfoItemRes => {
              return {
                bimFileId: it.bimFileId,
                dbIds: Array.from(it.dbIds),
              };
            }),
          });
        }
        const sizeRes = Array.isArray(options.dynamicId)
          ? options.dynamicId.length
          : 1;
        return res.status(resBody.length === sizeRes ? 200 : 206).json(resBody);
      } catch (e) {
        return res.status(500).send(e.message);
      }
    }
  );
};
