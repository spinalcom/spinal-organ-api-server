import * as express from 'express';
import {
  SpinalNode,
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
} from '../../utilities/visitNodesWithTypeRelation';

import { ISpinalAPIMiddleware } from '../../interfaces';
import { getProfileId } from '../../utilities/requestUtilities';

const all_GeoType: string[] = GEOGRAPHIC_TYPES_ORDER.concat(CONTEXT_TYPE);

/**
 * BFS traversal returning node + parent
 */
async function* visitNodesWithParent(
  root: SpinalNode,
  relationMap: TRelationMap
): AsyncGenerator<{ node: SpinalNode, parent: SpinalNode | null }> {

  const seen = new Set([root]);
  const queue: Array<{ node: SpinalNode, parent: SpinalNode | null }> = [
    { node: root, parent: null }
  ];

  while (queue.length) {
    const item = queue.shift()!;
    const node = item.node;

    yield item;

    const type = node.info.type.get();
    const relations = relationMap[type];
    if (!relations) continue;

    const children = await node.getChildren(relations);
    for (const child of children) {
      if (!seen.has(child)) {
        seen.add(child);
        queue.push({ node: child, parent: node });
      }
    }
  }
}

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: ISpinalAPIMiddleware
) {
  /**
   * Load root nodes (can be multiple)
   */
  async function getRootNodes(
    dynIds: number | number[],
    profileId: string
  ): Promise<SpinalNode[]> {
    const ids = Array.isArray(dynIds) ? dynIds : [dynIds];
    const result: SpinalNode[] = [];

    for (const dynId of ids) {
      try {
        const n = await spinalAPIMiddleware.load(dynId, profileId);
        if (n instanceof SpinalNode && all_GeoType.includes(n.info.type.get())) {
          result.push(n);
        }
      } catch (e) {
        console.error(`Error load dynId = ${dynId}`, e);
      }
    }

    return result;
  }

  /**
   * Build relations to traverse
   */
  function getRelationListFromOption(options: any): TRelationMap {
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

  /**
   * @swagger
   * /api/v1/geographicContext/viewInfo2:
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
   *         description: Flattened geographic tree with BIM alias dictionary
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 bimFileAlias:
   *                   type: object
   *                   additionalProperties:
   *                     type: string
   *                   example:
   *                     "1": "SpinalNode-7cc0401e-31fc-40c8-385d-c618d1df8bd2"
   *                     "2": "SpinalNode-a39ef912-7df0-11ee-995d-afa741c67b94"
   *                 nodes:
   *                   type: array
   *                   items:
   *                     $ref: "#/components/schemas/ViewInfoNode"
   *       "400":
   *         description: Invalid request (missing dynamicId)
   *       "500":
   *         description: Internal server error
   */
  app.post(
    '/api/v1/geographicContext/viewInfo2',
    async (req: any, res: any): Promise<any> => {
      const body = req.body;
      const profileId = getProfileId(req);

      const options = {
        dynamicId: body.dynamicId,
        floorRef: body.floorRef || false,
        roomRef: body.roomRef || true,
        equipements: body.equipements || false,
      };

      // Default behavior: if no dynamicId → return whole building
      if (!options.dynamicId) {
        const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
        const contexts = await graph.getChildren("hasContext");
        const geoContexts = contexts.filter(el => el.getType().get() === "geographicContext");
        const buildings = await geoContexts[0].getChildren("hasGeographicBuilding");
        const building = buildings[0];

        options.dynamicId = building._server_id;
        options.floorRef = true;
        options.roomRef = true;
        options.equipements = true;
      }

      // LOAD ROOT NODES
      const roots = await getRootNodes(options.dynamicId, profileId);

      const relations = getRelationListFromOption(options);

      // FLATTENED STRUCTURE
      // const flatNodes: Array<{
      //   dynamicId: number;
      //   parentId: number | null;
      //   dbId: number | null;
      //   bimFileAlias: number | null;
      //   type: string;
      // }> = [];

      const nodes: Record<number, {
        parentId: number | null;
        children: number[];
        dbId: number | null;
        bimFileAlias: number | null;
        type: string;
      }> = {};

      // BIM alias dictionary
      const bimFileAlias: Record<string, number> = {};
      let aliasCounter = 1;

      function getAlias(bimFileId: string): number {
        if (!bimFileAlias[bimFileId]) {
          bimFileAlias[bimFileId] = aliasCounter++;
        }
        return bimFileAlias[bimFileId];
      }

      // TRAVERSE EACH ROOT
      for (const root of roots) {
        for await (const { node, parent } of visitNodesWithParent(root, relations)) {

          const dynamicId = node._server_id;
          const parentId = parent ? parent._server_id : null;
          const type = node.info.type.get();

          let dbId = null;
          let alias = null;

          if (type === REFERENCE_TYPE || type === EQUIPMENT_TYPE) {
            dbId = node.info.dbid.get();
            alias = getAlias(node.info.bimFileId.get());
          }

          // Ensure current node exists
          if (!nodes[dynamicId]) {
            nodes[dynamicId] = {
              parentId,
              children: [],
              dbId,
              bimFileAlias: alias,
              type
            };
          }

          // Ensure parent exists & register child
          if (parentId !== null) {
            if (!nodes[parentId]) {
              nodes[parentId] = {
                parentId: null,
                children: [],
                dbId: null,
                bimFileAlias: null,
                type: parent!.info.type.get()
              };
            }

            nodes[parentId].children.push(dynamicId);
          }
        }
      }


      return res.json({
        bimFileAlias,
        nodes
      });
    }
  );
};