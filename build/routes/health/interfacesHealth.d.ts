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
