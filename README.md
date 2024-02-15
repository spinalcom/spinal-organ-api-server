# spinal-organ-api-server

## Change log 05/02/2024
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
