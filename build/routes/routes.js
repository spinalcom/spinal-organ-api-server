"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
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
function routes(logger, app, spinalAPIMiddleware) {
    //contexts routes
    require('./contexts/contextList')(logger, app, spinalAPIMiddleware);
    require('./contexts/contextTree')(logger, app, spinalAPIMiddleware);
    require('./contexts/contextTreeDepth')(logger, app, spinalAPIMiddleware);
    require('./contexts/contextNodeTypeList')(logger, app, spinalAPIMiddleware);
    require('./contexts/contextNodesOfType')(logger, app, spinalAPIMiddleware);
    // require('./contexts/geographicContext')(logger, app, spinalAPIMiddleware);
    //nodes routes in specific context
    require('./contexts/nodeTreeInContext')(logger, app, spinalAPIMiddleware);
    require('./contexts/contextNodeTypeListOfNode')(logger, app, spinalAPIMiddleware);
    require('./contexts/contextNodesOfTypeFornode')(logger, app, spinalAPIMiddleware);
    require('./contexts/findInContext')(logger, app, spinalAPIMiddleware);
    require('./contexts/contextFindNodeByDate')(logger, app, spinalAPIMiddleware);
    //nodes routes
    require('./nodes/node')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeCreate')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeDelete')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeDeleteFile')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeDeleteSmart')(logger, app, spinalAPIMiddleware);
    require('./nodes/readNodeMultiple')(logger, app, spinalAPIMiddleware);
    require('./nodes/relationChildrenNode')(logger, app, spinalAPIMiddleware);
    require('./nodes/relationParentNode')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeChildren')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeChildrenSpecificRelations')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeChildrenSpecificRelationsMultiple')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeChildrenInContextSpecificRelations')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeChildrenInContextSpecificRelationsMultiple')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeParentsSpecificRelations')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeParentsSpecificRelationsMultiple')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeParents')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeEndPointList')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeEndPointListMultiple')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeControlEndPointList')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeControlEndPointListMultiple')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeTicketList')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeTicketListMultiple')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeNoteList')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeFileList')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeUploadFile')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeDownloadFile')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeEventList')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeEventListMultiple')(logger, app, spinalAPIMiddleware);
    // require('./nodes/findInContext')(logger, app, spinalAPIMiddleware);
    require('./nodes/testUploadFileBase64')(logger, app, spinalAPIMiddleware);
    //attributs routes
    require('./attributs/attributList')(logger, app, spinalAPIMiddleware);
    require('./attributs/attributListMultiple')(logger, app, spinalAPIMiddleware);
    require('./attributs/updateAttributeMultiple')(logger, app, spinalAPIMiddleware);
    require('./attributs/createAttribut')(logger, app, spinalAPIMiddleware);
    require('./attributs/updateAttribute')(logger, app, spinalAPIMiddleware);
    require('./attributs/deleteAttribute')(logger, app, spinalAPIMiddleware);
    //categories routes
    require('./categoriesAttributs/categoriesList')(logger, app, spinalAPIMiddleware);
    require('./categoriesAttributs/createCategory')(logger, app, spinalAPIMiddleware);
    require('./categoriesAttributs/deleteCategoryById')(logger, app, spinalAPIMiddleware);
    require('./categoriesAttributs/updateCategoryById')(logger, app, spinalAPIMiddleware);
    require('./categoriesAttributs/readCategoryById')(logger, app, spinalAPIMiddleware);
    require('./categoriesAttributs/deleteCategoryByName')(logger, app, spinalAPIMiddleware);
    require('./categoriesAttributs/updateCategoryByName')(logger, app, spinalAPIMiddleware);
    require('./categoriesAttributs/readCategoryByName')(logger, app, spinalAPIMiddleware);
    require('./categoriesAttributs/readCategoryByNameMultiple')(logger, app, spinalAPIMiddleware);
    require('./categoriesAttributs/readCategoriesByNameMultiple')(logger, app, spinalAPIMiddleware);
    // scenes routes
    require('./BIM/scenes/list')(logger, app, spinalAPIMiddleware);
    require('./BIM/scenes/default')(logger, app, spinalAPIMiddleware);
    require('./BIM/scenes/item')(logger, app, spinalAPIMiddleware);
    require('./BIM/bimFileContext')(logger, app, spinalAPIMiddleware);
    require('./BIM/viewer/viewer')(logger, app, spinalAPIMiddleware);
    require('./BIM/getBimObjectsInfo')(logger, app, spinalAPIMiddleware);
    // tickets routes
    require('./tickets/workflows/createWorkflow')(logger, app, spinalAPIMiddleware);
    require('./tickets/workflows/deleteWorkflow')(logger, app, spinalAPIMiddleware);
    require('./tickets/workflows/updateWorkflow')(logger, app, spinalAPIMiddleware);
    require('./tickets/workflows/readWorkflow')(logger, app, spinalAPIMiddleware);
    require('./tickets/workflows/workflowList')(logger, app, spinalAPIMiddleware);
    require('./tickets/workflows/workflowTree')(logger, app, spinalAPIMiddleware);
    require('./tickets/workflows/workflowTypeList')(logger, app, spinalAPIMiddleware);
    require('./tickets/workflows/findNodeInWorkflow')(logger, app, spinalAPIMiddleware);
    require('./tickets/workflows/readNodeInWorkflow')(logger, app, spinalAPIMiddleware);
    require('./tickets/process/processList')(logger, app, spinalAPIMiddleware);
    require('./tickets/process/createProcess')(logger, app, spinalAPIMiddleware);
    require('./tickets/process/deleteProcess')(logger, app, spinalAPIMiddleware);
    require('./tickets/process/updateProcess')(logger, app, spinalAPIMiddleware);
    require('./tickets/steps/stepsListFromProcess')(logger, app, spinalAPIMiddleware);
    require('./tickets/steps/createStep')(logger, app, spinalAPIMiddleware);
    require('./tickets/steps/deleteStep')(logger, app, spinalAPIMiddleware);
    require('./tickets/steps/updateStep')(logger, app, spinalAPIMiddleware);
    // require('./tickets/tickets/ticketList')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/createTicket')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketNextStep')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketPreviousStep')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketAddNote')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketAddDoc')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketUnarchive')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketArchive')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/readTicket')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/readTicketMultiple')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketChangeProcess')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketChangeWorkflow')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketChangeNode')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketFindEntity')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketEventList')(logger, app, spinalAPIMiddleware);
    require('./tickets/tickets/ticketCreateEvent')(logger, app, spinalAPIMiddleware);
    //endPoints routes
    require('./IoTNetwork/IoTNetworkContext/IoTNetworkList')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/IoTNetworkContext/createIotNetwork')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/IoTNetworkContext/deleteIoTNetwork')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/IoTNetworkContext/updateIoTNetwork')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/IoTNetworkContext/IoTNetworkTree')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/IoTNetworkContext/findNodeInIoTNetwork')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/IoTNetworkContext/readNodeInIoTNetwork')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/IoTNetworkContext/IoTNetworkTypeList')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/BmsNetwork/createBmsNetwork')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/BmsNetwork/bmsNetworkList')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/BmsNetwork/deleteBmsNetwork')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/BmsNetwork/updateBmsNetwork')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/device/deviceList')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/device/createDevice')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/device/deleteDevice')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/device/updateDevice')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/endPoint/createEndPoint')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/endPoint/endointList')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/endPoint/endpointAttributs')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/endPoint/readEndPointCurrentValue')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/endPoint/readEndPointCurrentValueMultiple')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/endPoint/updateEndPointCurrentValue')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeries')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesMultiple')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesFrom Last24H')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesFromLast24HMultiple')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesCurrentDay')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesCurrentDayMultiple')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesCurrentWeek')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesCurrentWeekMultiple')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesCurrentMonth')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesCurrentMonthMultiple')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesCurrentYear')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/readTimeSeriesCurrentYearMultiple')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/pushTimeSeries')(logger, app, spinalAPIMiddleware);
    require('./IoTNetwork/timeSeries/insertTimeSeries')(logger, app, spinalAPIMiddleware);
    //context geographique routes
    require('./geographicContext/geographicContextTree')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/geographicContextSpace')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/building/readBuilding')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/building/buildingReferenceObjectsList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/floor/floorList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/floor/floorDetails')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/floor/floorInventory')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/readRoom')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/floor/floorReferencesObjectsList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomEquipementList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomEquipementListMultiple')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomReferenceObjectsList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomReferenceObjectsListMultiple')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomNotes')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomInventory')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomInventoryV2')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomInventoryMultiple')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/readRoomDetails')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/readRoomDetailsMultiple')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomEndPointList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomEndPointControlList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomTicketList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomEvent')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/roomFileList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/readStaticsDetails')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/room/readStaticsDetailsMultiple')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/floor/readStaticDetails')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/building/readStaticDetails')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/equipement/readEquipement')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/equipement/readEquipmentStaticDetails')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/equipement/readEquipmentStaticDetailsMultiple')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/equipement/equipementEndpointControlList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/equipement/equipementEndPoint')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/equipement/equipementEvent')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/equipement/equipementFileList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/equipement/equipementNotes')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/equipement/equipementTicketList')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/getEquipmentPositionNode')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/getEquipmentPositionNodeMultiple')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/getRoomPositionNode')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/getRoomPositionNodeMultiple')(logger, app, spinalAPIMiddleware);
    require('./geographicContext/viewInfo')(logger, app, spinalAPIMiddleware);
    // calendar & Event
    require('./calendar/EventContext/listEventContext')(logger, app, spinalAPIMiddleware);
    require('./calendar/EventContext/EventContextTree')(logger, app, spinalAPIMiddleware);
    require('./calendar/EventContext/createEventContext')(logger, app, spinalAPIMiddleware);
    require('./calendar/eventCategories/listEventCatedory')(logger, app, spinalAPIMiddleware);
    require('./calendar/eventCategories/createEventCategory')(logger, app, spinalAPIMiddleware);
    require('./calendar/eventGroup/listEventGroup')(logger, app, spinalAPIMiddleware);
    require('./calendar/eventGroup/createEventGroup')(logger, app, spinalAPIMiddleware);
    // require('./calendar/Events/enventList')(logger, app, spinalAPIMiddleware);
    require('./calendar/Events/removeEvent')(logger, app, spinalAPIMiddleware);
    require('./calendar/Events/updateEvent')(logger, app, spinalAPIMiddleware);
    require('./calendar/Events/createEvent')(logger, app, spinalAPIMiddleware);
    require('./calendar/Events/readEvent')(logger, app, spinalAPIMiddleware);
    require('./calendar/Events/readEventMultiple')(logger, app, spinalAPIMiddleware);
    require('./calendar/Events/eventList')(logger, app, spinalAPIMiddleware);
    // group context
    require('./groupContext/groupeContextTypeList')(logger, app, spinalAPIMiddleware);
    require('./groupContext/contextsOfType')(logger, app, spinalAPIMiddleware);
    // context CRUD
    require('./groupContext/context/listGroupContext')(logger, app, spinalAPIMiddleware);
    require('./groupContext/context/treeGroupContext')(logger, app, spinalAPIMiddleware);
    require('./groupContext/context/createGroupContext')(logger, app, spinalAPIMiddleware);
    require('./groupContext/context/updateGroupContext')(logger, app, spinalAPIMiddleware);
    require('./groupContext/context/deleteGroupContext')(logger, app, spinalAPIMiddleware);
    require('./groupContext/context/readGroupContext')(logger, app, spinalAPIMiddleware);
    // category CRUD
    require('./groupContext/category/listCategory')(logger, app, spinalAPIMiddleware);
    require('./groupContext/category/createCategory')(logger, app, spinalAPIMiddleware);
    require('./groupContext/category/updateCategory')(logger, app, spinalAPIMiddleware);
    require('./groupContext/category/deleteCategory')(logger, app, spinalAPIMiddleware);
    require('./groupContext/category/readCategory')(logger, app, spinalAPIMiddleware);
    // group CRUD
    require('./groupContext/group/listGroup')(logger, app, spinalAPIMiddleware);
    require('./groupContext/group/createGroup')(logger, app, spinalAPIMiddleware);
    require('./groupContext/group/updateGroup')(logger, app, spinalAPIMiddleware);
    require('./groupContext/group/deleteGroup')(logger, app, spinalAPIMiddleware);
    require('./groupContext/group/readGroup')(logger, app, spinalAPIMiddleware);
    // notes routes
    require('./notes/addNotes')(logger, app, spinalAPIMiddleware);
    // require('./notes/getnotes')(logger, app, spinalAPIMiddleware);
    require('./notes/updateNotes')(logger, app, spinalAPIMiddleware);
    // Rooms Group
    // Context
    require('./roomGroup/context/listGroupContext')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/context/treeGroupContext')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/context/createGroupContext')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/context/deleteGroupContext')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/context/readGroupContext')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/context/updateGroupContext')(logger, app, spinalAPIMiddleware);
    // Category
    require('./roomGroup/category/listCategory')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/category/createCategory')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/category/readCategory')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/category/updateCategory')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/category/deleteCategory')(logger, app, spinalAPIMiddleware);
    //  Group
    require('./roomGroup/group/listGroup')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/group/createGroup')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/group/updateGroup')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/group/deleteGroup')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/group/readGroup')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/room/listRoom')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/room/addRoomList')(logger, app, spinalAPIMiddleware);
    require('./roomGroup/room/deleteRoomFromGroup')(logger, app, spinalAPIMiddleware);
    // Endpoints Group
    // Context
    require('./endpointGroup/context/listGroupContext')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/context/treeGroupContext')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/context/createGroupContext')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/context/readGroupContext')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/context/updateGroupContext')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/context/deleteGroupContext')(logger, app, spinalAPIMiddleware);
    // Category
    require('./endpointGroup/category/listCategory')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/category/createCategory')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/category/readCategory')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/category/updateCategory')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/category/deleteCategory')(logger, app, spinalAPIMiddleware);
    // Group
    require('./endpointGroup/group/listGroup')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/group/createGroup')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/group/updateGroup')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/group/deleteGroup')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/group/readGroup')(logger, app, spinalAPIMiddleware);
    // endpoint
    require('./endpointGroup/endpoint/endpointList')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/endpoint/addEndPointList')(logger, app, spinalAPIMiddleware);
    require('./endpointGroup/endpoint/deleteEndPointList')(logger, app, spinalAPIMiddleware);
    // Equipements Group
    // Context
    require('./equipementGroup/context/listGroupContext')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/context/treeGroupContext')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/context/createGroupContext')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/context/readGroupContext')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/context/updateGroupContext')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/context/deleteGroupContext')(logger, app, spinalAPIMiddleware);
    // Category
    require('./equipementGroup/category/listCategory')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/category/createCategory')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/category/readCategory')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/category/updateCategory')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/category/deleteCategory')(logger, app, spinalAPIMiddleware);
    // Group
    require('./equipementGroup/group/listGroup')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/group/createGroup')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/group/updateGroup')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/group/deleteGroup')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/group/readGroup')(logger, app, spinalAPIMiddleware);
    // equipement
    require('./equipementGroup/equipement/equipementList')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/equipement/addEquipementList')(logger, app, spinalAPIMiddleware);
    require('./equipementGroup/equipement/deleteEquipementFromGroup')(logger, app, spinalAPIMiddleware);
    //endPoints routes
    // context nomenclature
    require('./nomenclatureGroup/context/listContextNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/context/readNomenclatureContext')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/context/deleteNomenclatureContext')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/context/createNomenclatureContext')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/context/updateNomenclatureContext')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/context/treeNomenclatureContext')(logger, app, spinalAPIMiddleware);
    //category nomenclature
    require('./nomenclatureGroup/category/listCategoryNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/category/createCategoryNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/category/readCategoryNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/category/updateCategoryNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/category/deleteCategoryNomenclature')(logger, app, spinalAPIMiddleware);
    //group nomenclature
    require('./nomenclatureGroup/group/listGroupNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/group/createGroupNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/group/readGroupNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/group/updateGroupNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/group/deleteGroupNomenclature')(logger, app, spinalAPIMiddleware);
    require('./nomenclatureGroup/nomenclature/listProfiles')(logger, app, spinalAPIMiddleware);
    // Analytics
    require('./analytics/roomResume')(logger, app, spinalAPIMiddleware);
    // command
    require('./command/roomListCommandEnable')(logger, app, spinalAPIMiddleware);
    require('./command/roomCommandLight')(logger, app, spinalAPIMiddleware);
    require('./command/roomCommandBlind')(logger, app, spinalAPIMiddleware);
    require('./command/roomCommandTemp')(logger, app, spinalAPIMiddleware);
    require('./command/roomCommandBlindSetValue')(logger, app, spinalAPIMiddleware);
    require('./command/roomCommandLightSetValue')(logger, app, spinalAPIMiddleware);
    require('./command/roomCommandTempSetValue')(logger, app, spinalAPIMiddleware);
    require('./nodes/nodeReadControlEndpoint')(logger, app, spinalAPIMiddleware);
    require('./command/commandMultiple')(logger, app, spinalAPIMiddleware);
    require('./health/healthStatus')(logger, app, spinalAPIMiddleware);
    require('./health/organStatus')(logger, app, spinalAPIMiddleware);
}
exports.default = routes;
//# sourceMappingURL=routes.js.map