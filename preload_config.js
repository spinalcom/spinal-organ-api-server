/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

module.exports = {
  // This file is is only used if PRELOAD_SCRIPT=1 in the .env file. It is used to preload data into the database when the server starts.

  // array of server_id to preload view info 
  runViewInfo: [
  ],
  // array of server_id to preload static details + ticket list details
  runStaticDetails: [
  ],
  // array of server_id (STEP) to preload ticket; do a getchildren then a getTicketDetails
  runTicketLists: [
  ],
  // array of floor inventories to preload. Each entry runs the floor inventory
  // (like POST /api/v1/floor/{id}/inventory) on every floor id, then, when
  // staticDetails is true, preloads the static details of every item found.
  inventories: [
    // {
    //   ids: [],             // Floor dynamic ids (server_id)
    //   context: '',         // Group context name (or use contextId)
    //   category: '',        // Category name (or use categoryId)
    //   groups: [],          // Group names to filter on (empty = every group of the category)
    //   staticDetails: false // preload static details of the resulting items
    // },

    {
      ids: [25434496],             // Floor dynamic ids (server_id)
      context: 'Gestion des équipements',         // Group context name (or use contextId)
      category: 'Typologie',        // Category name (or use categoryId)
      groups: [],          // Group names to filter on (empty = every group of the category)
      staticDetails: true // preload static details of the resulting items
    },
  ],
};