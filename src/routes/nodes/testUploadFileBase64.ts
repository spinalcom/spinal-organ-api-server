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

// import spinalAPIMiddleware from '../../spinalAPIMiddleware';
import * as express from 'express';
import { childrensNode, parentsNode } from '../../utilities/corseChildrenAndParentNode'
import { Node } from './interfacesNodes'
import { SpinalContext, SpinalNode, SpinalGraphService } from 'spinal-env-viewer-graph-service'
import { findOneInContext } from '../../utilities/findOneInContext';
import { ISpinalAPIMiddleware } from '../../interfaces';

module.exports = function (logger, app: express.Express, spinalAPIMiddleware: ISpinalAPIMiddleware) {

  /**
 * @swagger
 * /api/v1/node/convert_base_64:
 *   post:
 *     security: 
 *       - bearerAuth: 
 *         - read
 *     description: Find node object in a specific context
 *     summary: Gets Node
 *     tags:
 *       - Nodes
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageString
 *             properties:
 *               imageString:
 *                 type: string
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

  app.post("/api/v1/node/convert_base_64", async (req, res, next) => {
    try {


      const fs = require('fs');
      const base64 = req.body.imageString;
      const data = base64.replace(/^data:image\/\w+;base64,/, "");
      const ReadableData = require('stream').Readable
      const imageBufferData = Buffer.from(data, 'base64')
      const streamObj = new ReadableData()
      streamObj.push(imageBufferData)
      streamObj.push(null)
      streamObj.pipe(fs.createWriteStream('testImage1.jpg'));

    } catch (error) {

      if (error.code && error.message) return res.status(error.code).send(error.message);
      res.status(500).send(error.message);
    }
    res.json("convert string to image with succes");
  });
}

