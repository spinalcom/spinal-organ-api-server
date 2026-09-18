# spinal-organ-api-server

Api server that handles most of possible queries to spinalhub.

## [Changelog](CHANGELOG.md)

## Installation

### Install `spinalcom-utils`

If you don't have `spinalcom-utils` installed, you can install it with the following command:

```bash
npm i -g https://github.com/spinalcom/spinalcom-utils.git
```

Or you can install by cloning the repository and running the following command:

```bash
git clone https://github.com/spinalcom/spinalcom-utils.git
cd spinalcom-utils
npm install
npm link
```

Explaination of the commands:

- `npm i -g` : install the package globally for your current version of node , if you switch version of node with nvm for example, you will need to re-install the package.

- `npm link` : create a symbolic link in the global node_modules folder to the current package. This way, you can use the package as if it was installed globally.

For more information about spinalcom-utils, visit the [documentation](https://github.com/spinalcom/spinalcom-utils/blob/master/README.md)

### Install `spinal-organ-api-server`

You can install `spinal-organ-api-server` by running the following commands:

```bash
git clone https://github.com/spinalcom/spinal-organ-api-server.git
cd spinal-organ-api-server
spinalcom-utils i
```

### Requirements

You must have a .env file at the root of the project with the following variables :

````bash
SPINAL_USER_ID=XXX
SPINAL_PASSWORD="XXXXXXXXXXX"
SPINALHUB_IP=XXXXXXXX
SPINALHUB_PORT=XXXXX
SPINALHUB_PROTOCOL="XXXX"                     # http or https
REQUESTS_PORT="XXXX"                          # Port on which the server will listen
SPINAL_DTWIN_PATH="xxxxxxxxxxxxxxxxx"         # Path to the digital twin exemple : /__users__/admin/SmartBuilding

ORGAN_NAME="xxxxxxxxxx"                       # Name of the organ. Used by monitoring platform and ecosystem. If possible make the name obvious which platform/client it belongs to. For exemple : ClientName-Api-Server | no need to add the port and spinalhub port in the name, as they are added automatically
ORGAN_TYPE="api-server"                       # You can keep this as is. Used by monitoring platform to categorize the organs.
PRELOAD_SCRIPT="1"                         # OPTIONAL | if set to "1"; call a preloading data script before starting to listen, fill the preload_config.js file```

you can disable monitoring if you add the `DISABLE_MONITORING` in the .env file

```bash
DISABLE_MONITORING="true"                     # If not Commented will not enable monitoring
````

## Preloading : work hours and the node snapshot

`PRELOAD_SCRIPT="1"` enables preloading, and the time of day the organ starts at
decides how it preloads :

- **outside the work hours** : the preloading script runs as before, blocking,
  before the server starts listening (fill `preload_config.js`).
- **during the work hours** : the preloading script is skipped, the server
  listens right away, and the nodes of the last snapshot are loaded back
  progressively, a batch at a time, during the idle time between requests.

The snapshot itself is written by `POST /api/v1/snapshot/nodes`, which walks
`FileSystem._objects` and stores the `_server_id` of every loaded node. Take one
while the organ is warm (typically at the end of a working day) and the next
restart will know what is worth loading back.

```bash
WORK_HOURS_START="8"                          # OPTIONAL | default 8  | start of the work hours, "HH" or "HH:MM", local time
WORK_HOURS_END="19"                           # OPTIONAL | default 19 | end of the work hours, exclusive. A window ending before it starts wraps at midnight
SNAPSHOT_FILE="snapshots/nodes.json"          # OPTIONAL | default snapshots/nodes.json | where the snapshot is written and read back from
PRELOAD_IDLE_DELAY="2000"                     # OPTIONAL | default 2000 | ms without any request before the snapshot loader loads a batch. 0 disables the idle wait
PRELOAD_BATCH_SIZE="20"                       # OPTIONAL | default 20   | nodes loaded per batch. A batch that has started runs to its end, so this is also how much work can overlap with an incoming request
PRELOAD_BATCH_DELAY="50"                      # OPTIONAL | default 50   | ms between two batches
```

## Running the API Server

```bash
npm run start
# or with pm2 :
pm2 start ecosystem.config.js
```

The ecosystem.config is setup to run in cluster mode with `1` instance, if you want to change the number of instances, add in the .env `PM2_INSTANCES=` a `number` or `max` to use the maximum of threads of the computer.

```bash
PM2_INSTANCES=2
```

After it's launched in pm2 you can change the number of instances via

```bash
pm2 scale <process_name_in_pm2> <number_of_instances>
# ex: pm2 scale spinal-api-server-8816-8810 3
```
