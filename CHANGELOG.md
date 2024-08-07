# CHANGELOG

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