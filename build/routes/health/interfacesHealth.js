"use strict";
/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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
 *     HubStatus:
 *       type: "object"
 *       properties:
 *         state:
 *           type: "string"
 *           enum: [connecting, connected, disconnected, reconnecting, resyncing, closed, unknown]
 *         since:
 *           type: "integer"
 *           format: int64
 *           description: when the connection entered this state (ms timestamp)
 *         hub:
 *           type: "string"
 *           description: the url of the hub, without the credentials
 *         disconnections:
 *           type: "integer"
 *           description: times the hub stopped answering or dropped the session of the organ
 *         sessionsOpened:
 *           type: "integer"
 *           description: sessions opened with the hub, the first one included
 *         lastError:
 *           type: "object"
 *           nullable: true
 *           properties:
 *             at:
 *               type: "integer"
 *               format: int64
 *             message:
 *               type: "string"
 *         lastResync:
 *           type: "object"
 *           nullable: true
 *           properties:
 *             at:
 *               type: "integer"
 *               format: int64
 *             durationMs:
 *               type: "integer"
 *             reloaded:
 *               type: "integer"
 *               description: models loaded back, each with everything it holds
 *             missing:
 *               type: "integer"
 *               description: models in memory the hub does not know anymore
 */
//# sourceMappingURL=interfacesHealth.js.map