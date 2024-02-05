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
