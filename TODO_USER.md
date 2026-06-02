# User Context

## API

- [x] GET /api/v1/user/context
  - description: Get all the SpinalUserContext or a specific one if the name query parameter is provided
- [x] POST /api/v1/user/context
  - description: Create a SpinalUserContext
- [x] GET /api/v1/user/context/:contextId
  - description: Get a SpinalUserContext
- [x] GET /api/v1/user/context/:contextId/user
  - description: Get the SpinalUsers from a SpinalUserContext
- [x] POST /api/v1/user/context/:contextId/user
  - description: Create a SpinalUser from a SpinalUserContext
- [x] GET /api/v1/user/:userId
  - description: Get SpinalUser by the dynamicId
- [x] POST /api/v1/user/multiple
  - description: Search for multiple SpinalUser by their dynamicIds
- [x] DELETE /api/v1/user/:userId
  - description: Delete a SpinalUser
- [x] PATCH /api/v1/user/:userId
  - description: Update a SpinalUser

# User Group

## API

### user-group/context

- [x] GET /api/v1/user-group/context
  - description: Get all the SpinalUserContext
- [x] POST /api/v1/user-group/context
  - description: Create a SpinalUserContext
- [x] GET /api/v1/user-group/context/:contextId
  - description: Get a SpinalUserContext
- [x] PATCH /api/v1/user-group/context/:contextId
  - description: Update a SpinalUserContext
- [x] DELETE /api/v1/user-group/context/:contextId
  - description: Delete a SpinalUserContext

### category

- [x] GET /api/v1/user-group/context/:contextId/category
  - description: Get all the GroupingCategories of a SpinalUserContext
- [x] POST /api/v1/user-group/context/:contextId/category
  - description: Create a GroupingCategory in a SpinalUserContext
- [x] GET /api/v1/user-group/category/:categoryId
  - description: Get a GroupingCategory
- [x] PATCH /api/v1/user-group/category/:categoryId
  - description: Update a GroupingCategory
- [x] DELETE /api/v1/user-group/context/:contextId/category/:categoryId
  - description: Delete a GroupingCategory from a SpinalUserContext

### group

- [x] GET /api/v1/user-group/context/:contextId/category/:categoryId/group
  - description: Get all the UserGroup of a GroupingCategory via a SpinalUserContext
- [x] POST /api/v1/user-group/context/:contextId/category/:categoryId/group
  - description: Create a UserGroup in a GroupingCategory via a SpinalUserContext
- [x] GET /api/v1/user-group/group/:groupId
  - description: Get a UserGroup
- [x] PATCH /api/v1/user-group/group/:groupId
  - description: Update a UserGroup
- [x] DELETE /api/v1/user-group/group/:groupId
  - description: Delete a UserGroup

### user

- [x] GET /api/v1/user-group/context/:contextId/group/:groupId/user
  - description: Get all the Users of a UserGroup from a SpinalUserContext
- [x] POST /api/v1/user-group/context/:contextId/group/:groupId/user
  - description: Add Users to a UserGroup via a GroupingCategory and SpinalUserContext
- [x] DELETE /api/v1/user-group/group/:groupId/user/:userId
  - description: Delete User from a UserGroup
- [x] POST /api/v1/user-group/user/move
  - description: Move Users from an UserGroup to another UserGroup via SpinalUserContext

# Organization

## API

### context

- [x] GET /api/v1/organization/context
  - description: Get all the organization context
- [x] POST /api/v1/organization/context
  - description: Create an organization context
- [x] GET /api/v1/organization/context/:contextId
  - description: Get an organization context
- [x] PATCH /api/v1/organization/context/:contextId
  - description: Update an organization context
- ~~[ ] DELETE /api/v1/organization/context/:contextId~~
  - ~~description: Delete an organization context~~

### organization

- [x] GET /api/v1/organization/context/:contextId/organization
  - description: Get the organizations directly under an organization context
- [x] POST /api/v1/organization
  - description: Create an organization in an organization context or an organization
- [x] GET /api/v1/organization/context/:contextId/organization/:organizationId
  - description: Get the direct organizations children under an organization in an organization context
- ~[ ] POST /api/v1/organization/context/:contextId/organization/:organizationId~
  - ~description: Create an organizations children under an organization in an organization context~
- [ ] DELETE /api/v1/organization/:parentOrganizationId/:organizationIdToBeRemoved
  - description: Remove an organization from an organization
- [ ] DELETE /api/v1/organization/context/:contextId/:organizationIdToBeRemoved
  - description: Remove an organization from an organization context
- [ ] GET /api/v1/organization/:organizationId
  - description: Get an organization
- [ ] PATCH /api/v1/organization
  - description: Update multiple organizations
- [ ] GET /api/v1/organization/:organizationId/parents
  - description: Get the organization parents

### user group

- [ ] GET /api/v1/organization/context/:contextId/organization/:organizationId/user-group
  - description: Get all UserGroup from a organization in an organization context
- [ ] POST /api/v1/organization/context/:contextId/organization/:organizationId/user-group
  - description: Add an UserGroup in a organization from an organization context
- [ ] DELETE /api/v1/organization/:organizationId/user-group/:userGroupId
  - description: Remove an UserGroup from a organization
- [ ] POST /api/v1/organization/context/:contextId/user-group/move
  - description: Move an UserGroup from an organization to another organization in an organization context

### room group

- [ ] GET /api/v1/organization/context/:contextId/organization/:organizationId/room-group
  - description: Get all RoomGroup from a organization in an organization context
- [ ] POST /api/v1/organization/context/:contextId/organization/:organizationId/room-group
  - description: Add an RoomGroup in a organization from an organization context
- [ ] DELETE /api/v1/organization/:organizationId/room-group/:roomGroupId
  - description: Remove an RoomGroup from a organization
- [ ] POST /api/v1/organization/context/:contextId/user-group
  - description: Move an RoomGroup from an organization to another organization in an organization context

# interface

```ts
interface User {
  dynamicId: number;
  staticId: string;
  email: string;
  groups?: BasicNode[];
  organizations?: NodeWithParent[];
  attributes?: {
    // everything in category `User`
    [attributeLabel: string]: string;
  };
}
interface UserCreateOrEdit {
  email: string;
  attributes?: {
    // everything will be added as attribute in the category `User`
    [attributeLabel: string]: string;
  };
}
interface UserGetMultiple {
  dynamicIds: number[]; // array of user dynamic id
  attributes: boolean; // add attributes in the user; default = false
  groups: boolean;
  organizations: boolean;
}
interface BasicNode {
  dynamicId: number;
  name: string;
  type: string;
  staticId: string;
  color?: string;
}
interface NodeWithParent extends BasicNode {
  parentDynamicId: number;
}
interface CreateOrEditName {
  name: string;
}
interface CreateOrEditNameAndColor {
  name: string;
  color: string; // hex color code
}
interface MultipleDynIdBody {
  dynamicIds: number[]; // array of user dynamic id
}
interface DynIdAndNameBody {
  dynamicId: number;
  name: string;
}
```
