/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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

import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { childrensNode, parentsNode } from '../../utilities/corseChildrenAndParentNode'
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { findOneInContext } from '../../utilities/findOneInContext';
import { spinalCore, FileSystem } from 'spinal-core-connectorjs_type';
import { verifDate } from "../../utilities/dateFunctions";
import * as moment from 'moment'


module.exports = function (logger, app: express.Express, spinalAPIMiddleware: spinalAPIMiddleware) {

  /**
 * @swagger
 * /api/v1/find_node_in_context_by_date:
 *   post:
 *     security: 
 *       - OauthSecurity: 
 *         - readOnly
 *     description: Find node object in a specific context by date
 *     summary: Gets Node
 *     tags:
 *      - Contexts/ontologies
 *     requestBody: 
 *       description: => (context) use the dynamic ID <br>  => both fields (beginDate/endDate) are converted to GMT, so your search is a standard GMT query mechanism <br> => Date Format is "DD-MM-YYYY", "DD-MM-YYYY HH:mm:ss", "DD MM YYYY", "DD MM YYYY HH:mm:ss", "DD/MM/YYYY", "DD/MM/YYYY HH:mm:ss" <br> => the filter is applied to the directModifictionDate field <br> => directModificationDate is date of direct change on the node, example = declare a ticket on the piece node <br> => indirectModificationDate is change of a child or parent of the node, example = change a state of the ticket node linked to a piece node, 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contextId
 *               - beginDate
 *               - endDate
 *             properties:
 *               beginDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               contextId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema: 
 *               type: array
 *               items: 
 *                $ref: '#/components/schemas/NodeWithDate'
 *       400:
 *         description: Bad request
  */

  app.post("/api/v1/find_node_in_context_by_date", async (req, res, next) => {

    try {

      var context: SpinalContext<any> = await spinalAPIMiddleware.load(parseInt(req.body.contextId, 10))
      // @ts-ignore
      SpinalGraphService._addNode(context);

      var beginDateTimeZone = moment(req.body.beginDate, ["DD-MM-YYYY", "DD-MM-YYYY HH:mm:ss", "DD MM YYYY", "DD MM YYYY HH:mm:ss", "DD/MM/YYYY", "DD/MM/YYYY HH:mm:ss"], true);
      var endDateTimeZone = moment(req.body.endDate, ["DD-MM-YYYY", "DD-MM-YYYY HH:mm:ss", "DD MM YYYY", "DD MM YYYY HH:mm:ss", "DD/MM/YYYY", "DD/MM/YYYY HH:mm:ss"], true);

      var beginDate = beginDateTimeZone.utc();
      var endDate = endDateTimeZone.utc()
      var tab = [];



      await SpinalGraphService.findInContext(context.getId().get(), context.getId().get(), (node) => {
        if (node.info.directModificationDate) {
          var nodeDate = moment(node.info.directModificationDate.get())
          const test = moment(nodeDate).isBetween(beginDate, endDate);

          if (test == true) {
            var info = {
              dynamicId: node._server_id,
              staticId: node.getId().get(),
              name: node.getName().get(),
              type: node.getType().get(),
              directModificationDate: node.info.directModificationDate === undefined ? "" : node.info.directModificationDate.get(),
              indirectModificationDate: node.info.indirectModificationDate === undefined ? "" : node.info.directModificationDate.get()
            };
            tab.push(info)
          }

        }
        return true
      })

    } catch (error) {
      console.log(error);
      res.status(400).send("ko");
    }
    res.json(tab);
  });
}

