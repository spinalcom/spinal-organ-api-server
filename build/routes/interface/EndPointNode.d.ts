/**
 * @swagger
 * components:
 *   schemas:
 *     EndPointNode:
 *       type: "object"
 *       description: A BMS endpoint (a measure or a setpoint) as returned by the endpoint routes.
 *       properties:
 *         dynamicId:
 *           type: "integer"
 *           description: Volatile `_server_id` of the endpoint node, usable with the other node routes.
 *         staticId:
 *           type: "string"
 *           description: Persistent graph ID of the endpoint node.
 *         name:
 *           type: "string"
 *         type:
 *           type: "string"
 *         currentValue:
 *           description: Last value known by the hub. Its type follows the endpoint (number, boolean or string).
 *           oneOf:
 *             - type: number
 *             - type: boolean
 *             - type: string
 *         unit:
 *           type: "string"
 *           description: Unit of the value, when the endpoint declares one.
 *         saveTimeSeries:
 *           type: "boolean"
 *           description: Whether the hub records this endpoint into a time series.
 *         hasTimeSeries:
 *           type: "boolean"
 *           description: Whether a time series node is actually attached to this endpoint.
 *         controlValue:
 *           description: Value of the `controlValue` attribute. Only filled when `includeDetails=true`.
 *         timeseriesRetentionDays:
 *           description: Value of the `timeSeries maxDay` attribute, i.e. how many days of history are kept. Only filled when `includeDetails=true`.
 *         lastUpdate:
 *           type: "integer"
 *           format: int64
 *           description: Timestamp (ms) of the last direct modification of the endpoint node, when known.
 */
export interface EndPointNode {
    dynamicId: number;
    staticId: string;
    name: string;
    type: string;
    currentValue?: number;
    value?: number;
    unit?: string;
    saveTimeSeries?: boolean;
}
