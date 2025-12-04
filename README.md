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

```bash
SPINAL_USER_ID=XXX
SPINAL_PASSWORD="XXXXXXXXXXX"
SPINALHUB_IP=XXXXXXXX
SPINALHUB_PORT=XXXXX
SPINALHUB_PROTOCOL="XXXX"                     # http or https
REQUESTS_PORT="XXXX"                          # Port on which the server will listen
SPINAL_DTWIN_PATH="xxxxxxxxxxxxxxxxx"         # Path to the digital twin exemple : /__users__/admin/SmartBuilding
ORGAN_NAME="xxxxxxxxxx"                       # Name of the organ. Used by monitoring platform and ecosystem. If possible make the name obvious which platform/client it belongs to. For exemple : ClientName-Api-Server | no need to add the port and spinalhub port in the name, as they are added automatically
ORGAN_TYPE="api-server"                       # You can keep this as is. Used by monitoring platform to categorize the organs.
PRELOAD_VIEW_INFO="1"                         # OPTIONAL | call a viewInfo before starting to listen to preload the spatial
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
