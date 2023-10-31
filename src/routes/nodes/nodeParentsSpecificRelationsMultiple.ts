import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { getParentNodesInfo } from '../../utilities/getParentNodesInfo';
module.exports = function (
  logger,
  app: express.Express,
  spinalAPIMiddleware: spinalAPIMiddleware
) {
  /**
   * @swagger
   * /api/v1/node/parents_multiple:
   *   post:
   *     security:
   *       - OauthSecurity:
   *         - readOnly
   *     description: Returns an array of lists of children nodes for multiple parent nodes based on specified relations, including details of the child nodes or error information.
   *     summary: Retrieve children of multiple nodes based on relations
   *     tags:
   *       - Nodes
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               properties:
   *                 dynamicId:
   *                   type: integer
   *                   format: int64
   *                 relations:
   *                   type: array
   *                   items:
   *                     type: string
   *     responses:
   *       200:
   *         description: Success - All children nodes information for the specified relations fetched successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/BasicNodeMultiple'
   *       206:
   *         description: Partial Content - Some children node information based on the specified relations could not be fetched.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 oneOf:
   *                   - $ref: '#/components/schemas/BasicNodeMultiple'
   *                   - $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request - Invalid input or parameters.
   */
  app.post('/api/v1/node/parents_multiple', async (req, res) => {
    try {
      const nodes: [{ dynamicId: number; relations: string[] }] = req.body;
      if (!Array.isArray(nodes)) {
        return res
          .status(400)
          .send('Invalid relations format; an array is expected');
      }

      const promises = nodes.map( async (node) => {
        const parents = await getParentNodesInfo(
            node.dynamicId,
            spinalAPIMiddleware,
            node.relations
          );
        return {
          dynamicId: node.dynamicId,
          nodes: parents,
        };
      });
      const settledResults = await Promise.allSettled(promises);

      const finalResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(
            `Error with id ${nodes[index].dynamicId}: ${result.reason}`
          );
          return {
            dynamicId: nodes[index].dynamicId,
            error:
              result.reason?.message ||
              result.reason ||
              'Failed to get Parents',
          };
        }
      });
      const isGotError = settledResults.some(
        (result) => result.status === 'rejected'
      );
      if (isGotError) {
        return res.status(206).json(finalResults);
      }
      return res.status(200).json(finalResults);
    } catch (error) {
      console.error(error);
      res.status(400).send('An error occurred while fetching parents.');
    }
  });
};
