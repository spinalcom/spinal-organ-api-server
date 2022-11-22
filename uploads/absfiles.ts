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

const arrayOfRequests = ["/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/routes.ts",
  // contexts
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/contexts/contextList.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/contexts/contextTree.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/contexts/contextTreeDepth.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/contexts/nodeTreeInContext.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/contexts/contextNodeTypeList.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/contexts/contextNodeTypeListOfNode.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/contexts/contextNodesOfType.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/contexts/contextNodesOfTypeFornode.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/contexts/interfacesContexts.ts",
  // Nodes
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/nodes/interfacesNodes.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/nodes/node.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/nodes/nodeControlEndPointList.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/nodes/nodeEndPointList.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/nodes/nodeNoteList.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/nodes/nodeTicketList.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/nodes/relationChildrenNode.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/nodes/relationParentNode.ts",
  //Categories Attributs Nodes
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/categoriesAttributs/categoriesList.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/categoriesAttributs/createCategory.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/categoriesAttributs/deleteCategoryById.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/categoriesAttributs/deleteCategoryByName.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/categoriesAttributs/interfacesCategoriesAtrtribut.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/categoriesAttributs/readCategoryById.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/categoriesAttributs/readCategoryByName.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/categoriesAttributs/updateCategoryById.ts",
  "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/categoriesAttributs/updateCategoryByName.ts",
 "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/attributs/attributList.ts",
 "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/attributs/createAttribut.ts",
 "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/attributs/deleteAttribute.ts",
 "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/attributs/interfacesAttributs.ts",
 "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/attributs/updateAttribute.ts",
 "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/building/readBuilding.ts",
 "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/equipement/createEquipement.ts",
 "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/equipement/deleteEquipement.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/equipement/readEquipement.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/equipement/updateEquipement.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/floor/floorDetails.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/floor/floorList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/geographicContextTree.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/interfacesGeoContext.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/room/readRoom.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/room/readRoomDetails.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/room/roomEndPointControlList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/room/roomEndPointList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/room/roomEquipementList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/room/roomList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/room/roomNotes.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/geographicContext/room/roomTicketList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/BmsNetwork/bmsNetworkList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/BmsNetwork/createBmsNetwork.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/BmsNetwork/deleteBmsNetwork.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/BmsNetwork/updateBmsNetwork.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/IoTNetworkContext/IoTNetworkList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/IoTNetworkContext/IoTNetworkTree.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/IoTNetworkContext/IoTNetworkTypeList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/IoTNetworkContext/createIotNetwork.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/IoTNetworkContext/deleteIoTNetwork.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/IoTNetworkContext/findNodeInIoTNetwork.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/IoTNetworkContext/readNodeInIoTNetwork.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/IoTNetworkContext/updateIoTNetwork.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/device/createDevice.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/device/deleteDevice.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/device/deviceList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/device/updateDevice.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPoint/createEndPoint.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPoint/deleteEndPoint.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPoint/endointList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPoint/endpointAttributs.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPoint/readEndPointCurrentValue.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPoint/updateEndPointCurrentValue.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPointGroup/endpointGroupCreate.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPointGroup/endpointGroupDelete.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPointGroup/endpointGroupList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/endPointGroup/endpointGroupUpdate.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/interfacesEndpointAndTimeSeries.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/networkService.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/spinalTimeSeries.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/timeSeries/insertTimeSeries.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/timeSeries/pushTimeSeries.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/timeSeries/readTimeSeries.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/timeSeries/readTimeSeriesCurrentDay.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/timeSeries/readTimeSeriesCurrentMonth.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/timeSeries/readTimeSeriesCurrentWeek.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/timeSeries/readTimeSeriesCurrentYear.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/IoTNetwork/timeSeries/readTimeSeriesFrom Last24H.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/interfacesWorkflowAndTickets.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/process/createProcess.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/process/deleteProcess.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/process/processList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/process/updateProcess.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/steps/createStep.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/steps/deleteStep.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/steps/stepsListFromProcess.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/steps/updateStep.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/tickets/createTicket.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/tickets/readTicket.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/tickets/ticketAddDoc.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/tickets/ticketAddNote.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/tickets/ticketArchive.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/tickets/ticketChangeProcess.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/tickets/ticketNextStep.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/tickets/ticketPreviousStep.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/tickets/ticketUnarchive.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/workflows/createWorkflow.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/workflows/deleteWorkflow.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/workflows/findNodeInWorkflow.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/workflows/readNodeInWorkflow.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/workflows/readWorkflow.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/workflows/updateWorkflow.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/workflows/workflowList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/workflows/workflowTree.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/tickets/workflows/workflowTypeList.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/notes/addNotes.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/notes/getNotes.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/notes/interfacesNotes.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/notes/updateNotes.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/BIM/BimObjectUtils.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/BIM/getBimObjectsInfo.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/BIM/scenes/default.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/BIM/scenes/interfaces.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/BIM/scenes/item.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/BIM/scenes/list.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/BIM/scenes/sceneUtils.ts", "/home/spinalcom/Documents/APIs/spinal-api-gateway/spinal-api-requests/src/routes/BIM/viewer/viewer.ts"]
export default arrayOfRequests;