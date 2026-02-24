# CHANGELOG

## 24-02-2026 -> v1.1.8
- Floor inventory and room inventory now also accept IDs for context category and group
- getBIMObjectInfo correctly skips broken parent relations ( it was skipping all parents )
- getTicketDetails priority would be replaced my attribute if the priority is 0 

## 20-02-2026 -> v1.1.7
- BimObjectUtils.ts -> parentsNode now skips parent relations that are broken

## 06-02-2026 -> v1.1.6
- node/id/endpoint_list has an option for more details

## 05-02-2026 -> v1.1.5
- Create category attribute and create attribute return dynamicId
- node/id/control_endpoint_list has an option for more details

## 13-10-2025 -> v1.1.0
- Added routes /context/:idContext/node/:idNode/parents to get parents of a node in a context based on specific relations. Also added /context/{id}/node/parents_multiple for multiple nodes.
- Merge with dev-ticket-service-ticket branch + fixes

## 26-09-2025 -> v1.0.53
- Added route /api/v1/endpoint/:id/timeSeries/bulk-insert to bulk insert time series data from an excel file.
- Hotfix ticket more safeguards on missing optional info

## 11/09/2025 -> v1.0.52
- Modified and cleaned up create context, category and group routes

## 01/09/2025 -> v1.0.51
- Filtered out dbId = -1 in viewInfo response

## 28/08/2025 -> v1.0.50
- Modified room context, category and group creation, now handles icon and color on all of them
- Modified room context, category and group creation, now also returns server_id of the created nodes.
- Fixed an error if the roomcontext name is already taken.

## 21/08/2025 -> v1.0.49
- Added additional info in multiple apis ( color , icon, dbid and bimFileId)
- Improved logging , and support for bos-config

## 04/07/2025 -> v1.0.48
- Modified api /api/v1/node/command definition to correctly use bearer token authentication
- Modified api /api/v1/node/command to be cleaner

## 21/05/2025 -> v1.0.47
- Added optional field groups in /api/v1/floor/:id/inventory to filter for specific groups
- Added better logging for the api server, require dependency reinstallation.

## 28/04/2025 -> v1.0.46
- Added frequent log for viewInfo progress
- Read static details now fetch endpoints recursively

## 22/04/2025 -> v1.0.45
- Added dynamicIds property in viewInfo response

## 22/04/2025 -> v1.0.44
- Added route /api/v1/ticket/:ticketId/move_to_step
- Added route /api/v1/ticket/:ticketId/update

## 15/04/2025 -> v1.0.43
- Switched to spinalcom-utils installation
- Added ecosystem.config.js for pm2 and possibility to run in cluster by adding env variables

## 08/04/2025 -> v1.0.42
- Added route api/v1/context/:contextId/node/:nodeId/get_position 

## 01/04/2025 -> v1.0.41
- Added option to automatically run an api call after process starts with AUTO_CALL_ROUTE env variable

## 17/03/2025 -> v1.0.40
- Added route POST room/{id}/inventory v2 , with same features as floor/{id}/inventory

## 28/02/2025 -> v1.0.39
- Added route floor/{id}/inventory

## 12/02/2025 -> v1.0.38
- Added Color info if available in inventory routes

## 16/01/2025 -> v1.0.37
- Added route /api/v1/context/:idContext/node/:idNode/children to get children in context for singular node ( also by relation )

## 16/01/2025 -> v1.0.36
- Added route /api/v1/context/:id/node/children_multiple to get children in context for multiple nodes ( also by relation )

## 20/12/2024 -> v1.0.35
- Added dynamicId in node/attribute routes
- Route processList is ready to return color for processes if they exist
- Added icon in all group list routes

## 19/12/2024 -> v1.0.34
- Added dynamicId in attribute infos

## 11/12/2024 -> v1.0.33
- Added route node/:id/delete_file/:fileId to delete a file from a node

## 04/12/2024 -> v1.0.32
- Added unit and saveTimeSeries in route node/control_endpoint_list and only unit in route node/endpoint_list
- Added saveTimeseries in route node/endpoint_list

## 02/12/2024 -> v1.0.31
- Added unit in routes equipement/endpoint_list , equipement/control_endpoint_list, room/endpoint_list, room/control_endpoint_list
- Added cleaning of empty models in create_ticket route

## 26/11/2024 -> v1.0.31
- Added optional query parameters to inlcude or not children relations and parent relations in node read multiple

## 20/11/2024 -> v1.0.30
- Fix error in all room command routes

## 19/11/2024 -> v1.0.29
- Added https support for BIM/file route

## 07/11/2024 -> v1.0.28
- Removed onConnectionError 

## 30/10/2024 -> v1.0.27
- node/:id/children fixed Can't set headers after they are sent to the client
- node/:id/read fixed Can't set headers after they are sent to the client
- roomsGroup/:contextId/category/:categoryId/group/:groupId/roomList fixed Can't set headers after they are sent to the client
- findOneInContext utility function changed to use visitChildrenInContext

## 11/10/2024 -> v1.0.26
- Modified room/:id/ticket_list to use the same function as the other ticket_list routes.

## 09/10/2024 -> v1.0.26
- Added BimFileId for each reference_object in room/id/reference_Objects_list

## 07/10/2024 -> v1.0.26
- Added option in /node/:id/ticket_list to include or not attached items information such as notes and files.

## 30/09/2024 -> v1.0.26
- Added option in /endpoint/id/update to update control value of bms endpoint.

## 13/09/2024 -> v1.0.25
- Fix building/read. Does not calculate area anymore. This was causing a timeout on big buildings.
Therefore, the area is now taken from attribute on building.
- Refacto building/read. Now uses attribute service.

## 05/09/2024 -> v1.0.25
- Added reference objects handling in equipement/id/get_position

## 03/09/2024 -> v1.0.25
- Fix node/read_ticket route. Was missing an await.

## 21/08/2024 -> v1.0.25
- Fix /group/add_Rooms route - Problem was from group manager service using SpinalGraphService
- Fix /scene/list

## 22/07/2024 -> v1.0.24
- Fix find_node_in_context. Correctly display dynamicId or staticId based on searchNodeOption

## 18/07/2024 -> v1.0.24
- Refacto create_ticket route.
- Possible known issue on create_ticket : When hub is too busy, the ticket created doesn't get a server_id assigned in a reasonable time. This would result in the api call timeout but the ticket still create.

## 16/07/2024 -> v1.0.23
- Better code for find_node_in_context
- Fixed user property in find_node_in_context and read_ticket
- Modified find_node_in_context to still return an answer if some nodes have issues
- find_node_in_context now displays more accurate error messages

## 15/07/2024 -> v1.0.22
- Fix commandMultiple
- Fix updateControlEndpoint
- Added back categories in node/find_node_in_context for tickets
- Health Status tolerance increased to 5 minutes

## 26/06/2024 -> v1.0.21
- Fix error if "version" property is missing from BimObject in route equipement_list 

## 05/02/2024
Proceeded to a force push on the main branch. 
If you were working on the main branch, you will need to reset your local branch to the remote branch.
To do so, you can use the following commands:
```bash
git fetch origin
git checkout main
git reset --hard origin/main
```

If you wish to use the old main branch, you can find it under the name `backup-main`.


If you have local changes that you want to keep, you can stash them before running the reset command:
```bash
git stash
``` 
Then, after the reset, you can apply the stash:
```bash
git stash pop
```