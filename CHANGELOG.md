# CHANGELOG

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