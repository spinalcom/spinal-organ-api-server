/**
 * @swagger
 * components:
 *   schemas:
 *     HealthStatus:
 *       type: "object"
 *       properties:
 *         name:
 *           type: "integer"
 *         bootTimestamp:
 *           type: "string"
 *         lastHealthTime:
 *           type: "string"
 *         ramRssUsed:
 *           type: "string"
 *         logList:
 *           type: "array"
 *           items:
 *             type: "object"
 */
export interface HealthStatus {
    name: string;
    bootTimestamp: number;
    lastHealthTime: number;
    ramRssUsed: string;
    state: string;
    logList: string[];
}
/**
 * @swagger
 * components:
 *   schemas:
 *     OrganStatus:
 *       type: "object"
 *       properties:
 *         message:
 *           type: "string"
 *         organs_down:
 *           type: "array"
 *           items:
 *             $ref: '#/components/schemas/HealthStatus'
 */
export interface OrganStatus {
    message: string;
    organs_down: HealthStatus[];
}
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
