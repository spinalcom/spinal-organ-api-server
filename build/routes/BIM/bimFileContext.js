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
const requestUtilities_1 = require("../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    /**
     * @swagger
     * /api/v1/BIM/BIMFileContext/list:
     *   get:
     *     security:
     *       - bearerAuth:
     *         - readOnly
     *     description: Return list of BIM File Contexts
     *     summary: Get the list  BIM File Contexts
     *     tags:
     *       - BIM
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/BIMFileContext'
     *       400:
     *         description: scene not found
     *       500:
     *         description: internal error
     */
    app.get('/api/v1/BIM/BIMFileContext/list', async (req, res) => {
        const nodes = [];
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const graph = await spinalAPIMiddleware.getProfileGraph(profileId);
            const contexts = await graph.getChildren('hasContext');
            for (const context of contexts) {
                if (context.getName().get() === 'BimFileContext') {
                    const childrens = await context.getChildren('hasBimFile');
                    for (const children of childrens) {
                        const element = await children.element.load();
                        const currentVersion = await spinalAPIMiddleware.loadPtr(element.currentVersion);
                        const items = [];
                        for (let i = 0; i < currentVersion.items.length; i++) {
                            const element = currentVersion.items[i];
                            items.push({
                                name: element.name?.get(),
                                path: element.path?.get(),
                                thumbnail: element.thumbnail?.get(),
                                aecPath: currentVersion.aecPath?.get(),
                            });
                        }
                        const info = {
                            dynamicId: children._server_id,
                            staticId: children.getId().get(),
                            name: children.getName().get(),
                            type: children.getType().get(),
                            offset: currentVersion.offset?.get(),
                            items,
                        };
                        nodes.push(info);
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
            res.status(400).send('list of contexts is not loaded');
        }
        res.send(nodes);
    });
};
//# sourceMappingURL=bimFileContext.js.map