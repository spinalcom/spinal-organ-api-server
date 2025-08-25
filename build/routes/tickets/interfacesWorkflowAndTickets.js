"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 *         elementSelected:
 *           type: integer
 *           description: "the Element dynamicId where the ticket is created"
 *         priority:
 *           type: integer
 *           enum: [0, 1, 2]
 *           description: "Priority levels — 0 (OCCASIONALLY), 1 (NORMAL), 2 (URGENT)"
 *         description:
 *           type: "string"
 *         declarer_id:
 *           type: "string"
 *           description: "The ID of the user who declared the ticket"
 *         creationDate:
 *           type: "integer"
 *           description: "The timestamp of the creation of the ticket, in milliseconds since the epoch"
 *         errorImages:
 *           type: string
 *           description: "A string containing error messages related to image uploads, if any"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     BasicNode:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Process:
 *       type: "object"
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *         staticId:
 *           type: "string"
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     LogTicket:
 *       type: "object"
 *       properties:
 *         userName:
 *           type: "string"
 *         date:
 *           type: "number"
 *         event:
 *           type: "number"
 *         ticketStaticId:
 *           type: "string"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     WorkflowNodeTypeList:
 *       type: array
 *       items:
 *         type: string
 */
//# sourceMappingURL=interfacesWorkflowAndTickets.js.map