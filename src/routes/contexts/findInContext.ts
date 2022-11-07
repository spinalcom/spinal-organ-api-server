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
import {
  childrensNode,
  parentsNode,
} from '../../utilities/corseChildrenAndParentNode';
import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import { findOneInContext } from '../../utilities/findOneInContext';
import { spinalCore, FileSystem } from 'spinal-core-connectorjs_type';

module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/find_node_in_context:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Find node object in a specific context
   *     summary: Gets Node
   *     tags:
   *      - Contexts/ontologies
   *     requestBody:
   *       description: (optionSearchNodes) this field takes a string that allows us to search either by dynamicId, the staticId or by name, (dynamicId), (staticId), (name) / (optionResult) this field takes a string that allows us to choose the type of result / either a standard result, or a detailed result by putting the type of the node.(standard) / (type of node (example = ticket)) (context) this field takes a string either the name of the context, the dynamicId or the staticId / (array) this field takes a list of strings according to your choice of fields (optionNodes from research)
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - optionSearchNodes
   *               - optionResult
   *               - context
   *               - array
   *             properties:
   *               optionSearchNodes:
   *                 type: string
   *               optionResult:
   *                 type: string
   *               context:
   *                 type: string
   *               array:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/Node'
   *       400:
   *         description: Bad request
   */

  app.post('/api/v1/find_node_in_context', async (req, res, next) => {
    try {
      var info;
      await spinalAPIMiddleware.getGraph();
      const tab = req.body.array;
      const paramContext = req.body.context;
      var result = [];
      var context: SpinalContext<any> = await verifyContext(paramContext);
      /**********************context************************/

      async function verifyContext(paramContext: string) {
        if (typeof FileSystem._objects[paramContext] !== 'undefined') {
          return (context = await spinalAPIMiddleware.load(
            parseInt(paramContext, 10)
          ));
        } else if (SpinalGraphService.getRealNode(paramContext)) {
          return (context = SpinalGraphService.getRealNode(paramContext));
        } else if (SpinalGraphService.getContext(paramContext)) {
          return (context = SpinalGraphService.getContext(paramContext));
        } else {
          res.status(400).send('context not exist');
        }
      }

      /***************** ***optionSearchNodes**************/
      if (req.body.optionSearchNodes === 'dynamicId') {
        let nodes = [];
        for (let index = 0; index < tab.length; index++) {
          let node: SpinalNode<any> = await spinalAPIMiddleware.load(
            parseInt(tab[index], 10)
          );
          nodes.push(node);
        }
        for (const _node of nodes) {
          if (_node.belongsToContext(context)) {
            if (req.body.optionResult === 'ticket') {
              //Step
              let _step = await _node
                .getParents('SpinalSystemServiceTicketHasTicket')
                .then((steps) => {
                  for (const step of steps) {
                    if (
                      step.getType().get() ===
                      'SpinalSystemServiceTicketTypeStep'
                    ) {
                      return step;
                    }
                  }
                });
              let _process = await _step
                .getParents('SpinalSystemServiceTicketHasStep')
                .then((processes) => {
                  for (const process of processes) {
                    if (
                      process.getType().get() === 'SpinalServiceTicketProcess'
                    ) {
                      return process;
                    }
                  }
                });
              let elementSelected;
              try {
                if (_node.info.elementSelected !== undefined)
                  elementSelected = await spinalAPIMiddleware.loadPtr(
                    _node.info.elementSelected
                  );
                else
                  elementSelected = SpinalGraphService.getRealNode(
                    _node.info.nodeId.get()
                  );
              } catch (error) {
                console.error(error);
              }
              info = {
                dynamicId: _node._server_id,
                staticId: _node.getId().get(),
                name: _node.getName().get(),
                type: _node.getType().get(),
                priority: _node.info.priority.get(),
                creationDate: _node.info.creationDate.get(),
                elementSelected:
                  elementSelected == undefined
                    ? 0
                    : {
                      dynamicId: elementSelected._server_id,
                      staticId: elementSelected.getId().get(),
                      name: elementSelected.getName().get(),
                      type: elementSelected.getType().get(),
                    },
                userName:
                  _node.info.user == undefined
                    ? ''
                    : _node.info.user.name.get(),
                gmaoId:
                  _node.info.gmaoId == undefined ? '' : _node.info.gmaoId.get(),
                gmaoDateCreation:
                  _node.info.gmaoDateCreation == undefined
                    ? ''
                    : _node.info.gmaoDateCreation.get(),
                description:
                  _node.info.description == undefined
                    ? ''
                    : _node.info.description.get(),
                declarer_id:
                  _node.info.declarer_id == undefined
                    ? ''
                    : _node.info.declarer_id.get(),
                process: {
                  dynamicId: _process._server_id,
                  staticId: _process.getId().get(),
                  name: _process.getName().get(),
                  type: _process.getType().get(),
                },
                step: {
                  dynamicId: _step._server_id,
                  staticId: _step.getId().get(),
                  name: _step.getName().get(),
                  type: _step.getType().get(),
                  color: _step.info.color.get(),
                  order: _step.info.order.get(),
                },
                workflowId: context._server_id,
                workflowName: context.getName().get(),
              };
              result.push(info);
            } else {
              info = {
                dynamicId: _node._server_id,
                staticId: _node.getId().get(),
                name: _node.getName().get(),
                type: _node.getType().get(),
              };
              result.push(info);
            }
          } else res.status(400).send('one of node not exist in this context');
        }
      } else if (req.body.optionSearchNodes === 'staticId') {
        let nodes = [];
        for (let index = 0; index < tab.length; index++) {
          let node: SpinalNode<any> = SpinalGraphService.getRealNode(
            tab[index]
          );
          if (typeof node === 'undefined') {
            node = await findOneInContext(
              context,
              context,
              (n) => n.getId().get() === tab[index]
            );
          }
          nodes.push(node);
        }

        for (const _node of nodes) {
          if (_node !== undefined) {
            if (
              context instanceof SpinalContext &&
              _node.belongsToContext(context)
            ) {
              if (req.body.optionResult === 'ticket') {
                //Step
                let _step = await _node
                  .getParents('SpinalSystemServiceTicketHasTicket')
                  .then((steps) => {
                    for (const step of steps) {
                      if (
                        step.getType().get() ===
                        'SpinalSystemServiceTicketTypeStep'
                      ) {
                        return step;
                      }
                    }
                  });
                let _process = await _step
                  .getParents('SpinalSystemServiceTicketHasStep')
                  .then((processes) => {
                    for (const process of processes) {
                      if (
                        process.getType().get() === 'SpinalServiceTicketProcess'
                      ) {
                        return process;
                      }
                    }
                  });
                let elementSelected;
                try {
                  if (_node.info.elementSelected !== undefined)
                    elementSelected = await spinalAPIMiddleware.loadPtr(
                      _node.info.elementSelected
                    );
                  else
                    elementSelected = SpinalGraphService.getRealNode(
                      _node.info.nodeId?.get()
                    );
                } catch (error) {
                  console.error(error);
                }
                info = {
                  dynamicId: _node._server_id,
                  staticId: _node.getId().get(),
                  name: _node.getName().get(),
                  type: _node.getType().get(),
                  priority: _node.info.priority.get(),
                  creationDate: _node.info.creationDate.get(),
                  elementSelected:
                    elementSelected == undefined
                      ? 0
                      : {
                        dynamicId: elementSelected._server_id,
                        staticId: elementSelected.getId().get(),
                        name: elementSelected.getName().get(),
                        type: elementSelected.getType().get(),
                      },
                  userName:
                    _node.info.user == undefined
                      ? ''
                      : _node.info.user.name.get(),
                  gmaoId:
                    _node.info.gmaoId == undefined ? '' : _node.info.gmaoId.get(),
                  gmaoDateCreation:
                    _node.info.gmaoDateCreation == undefined
                      ? ''
                      : _node.info.gmaoDateCreation.get(),
                  description:
                    _node.info.description == undefined
                      ? ''
                      : _node.info.description.get(),
                  declarer_id:
                    _node.info.declarer_id == undefined
                      ? ''
                      : _node.info.declarer_id.get(),
                  process: {
                    dynamicId: _process._server_id,
                    staticId: _process.getId().get(),
                    name: _process.getName().get(),
                    type: _process.getType().get(),
                  },
                  step: {
                    dynamicId: _step._server_id,
                    staticId: _step.getId().get(),
                    name: _step.getName().get(),
                    type: _step.getType().get(),
                    color: _step.info.color.get(),
                    order: _step.info.order.get(),
                  },
                  workflowId: context._server_id,
                  workflowName: context.getName().get(),
                };
                result.push(info);
              } else {
                info = {
                  dynamicId: _node._server_id,
                  staticId: _node.getId().get(),
                  name: _node.getName().get(),
                  type: _node.getType().get(),
                };
                result.push(info);
              }
            } else res.status(400).send('one of node not exist in this context');
          }

        }
      } else if (req.body.optionSearchNodes === 'name') {
        if (context) {
          let res = await SpinalGraphService.findInContext(
            context.getId().get(),
            context.getId().get()
          );
          for (const _node of res) {
            for (const _name of tab) {
              if (_node.name.get() === _name) {
                let node: SpinalNode<any> = SpinalGraphService.getRealNode(
                  _node.id.get()
                );
                if (typeof node === 'undefined') {
                  node = await findOneInContext(
                    context,
                    context,
                    (n) => n.getId().get() === _node.id.get()
                  );
                }
                if (req.body.optionResult === 'ticket') {
                  //Step
                  let _step = await node
                    .getParents('SpinalSystemServiceTicketHasTicket')
                    .then((steps) => {
                      for (const step of steps) {
                        if (
                          step.getType().get() ===
                          'SpinalSystemServiceTicketTypeStep'
                        ) {
                          return step;
                        }
                      }
                    });
                  let _process = await _step
                    .getParents('SpinalSystemServiceTicketHasStep')
                    .then((processes) => {
                      for (const process of processes) {
                        if (
                          process.getType().get() ===
                          'SpinalServiceTicketProcess'
                        ) {
                          return process;
                        }
                      }
                    });
                  let elementSelected;
                  try {
                    if (node.info.elementSelected !== undefined)
                      elementSelected = await spinalAPIMiddleware.loadPtr(
                        node.info.elementSelected
                      );
                    else
                      elementSelected = SpinalGraphService.getRealNode(
                        node.info.nodeId.get()
                      );
                  } catch (error) {
                    console.error(error);
                  }
                  info = {
                    dynamicId: _node._server_id,
                    staticId: _node.getId().get(),
                    name: _node.getName().get(),
                    type: _node.getType().get(),
                    priority: _node.info.priority.get(),
                    creationDate: _node.info.creationDate.get(),
                    elementSelected:
                      elementSelected == undefined
                        ? 0
                        : {
                          dynamicId: elementSelected._server_id,
                          staticId: elementSelected.getId().get(),
                          name: elementSelected.getName().get(),
                          type: elementSelected.getType().get(),
                        },
                    userName:
                      _node.info.user == undefined
                        ? ''
                        : _node.info.user.name.get(),
                    gmaoId:
                      _node.info.gmaoId == undefined
                        ? ''
                        : _node.info.gmaoId.get(),
                    gmaoDateCreation:
                      _node.info.gmaoDateCreation == undefined
                        ? ''
                        : _node.info.gmaoDateCreation.get(),
                    description:
                      _node.info.description == undefined
                        ? ''
                        : _node.info.description.get(),
                    declarer_id:
                      _node.info.declarer_id == undefined
                        ? ''
                        : _node.info.declarer_id.get(),
                    process: {
                      dynamicId: _process._server_id,
                      staticId: _process.getId().get(),
                      name: _process.getName().get(),
                      type: _process.getType().get(),
                    },
                    step: {
                      dynamicId: _step._server_id,
                      staticId: _step.getId().get(),
                      name: _step.getName().get(),
                      type: _step.getType().get(),
                      color: _step.info.color.get(),
                      order: _step.info.order.get(),
                    },
                    workflowId: context._server_id,
                    workflowName: context.getName().get(),
                  };
                  result.push(info);
                } else {
                  info = {
                    dynamicId: node._server_id,
                    staticId: node.getId().get(),
                    name: node.getName().get(),
                    type: node.getType().get(),
                  };
                  result.push(info);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).send('ko');
    }
    res.json(result);
  });
};
