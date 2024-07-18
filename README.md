# spinal-organ-api-server

Api server that handles most of possible queries to spinalhub.


## [Changelog](CHANGELOG.md)

## Installation

```bash
git clone https://github.com/spinalcom/spinal-organ-api-server.git
cd spinal-organ-api-server
npm i
```

### Requirements 

You must have a .env file at the root of the project with the following variables :

```bash
SPINAL_USER_ID=XXX
SPINAL_PASSWORD="XXXXXXXXXXX"
SPINALHUB_IP=XXXXXXXX
SPINALHUB_PORT=XXXXX
SPINALHUB_PROTOCOL="XXXX"                     # http or https
REQUESTS_PORT="3000"                          # Port on which the server will listen
SPINAL_DTWIN_PATH="xxxxxxxxxxxxxxxxx"         # Path to the digital twin exemple : /__users__/admin/SmartBuilding
ORGAN_NAME="xxxxxxxxxx"                       # Name of the organ. Used by monitoring platform. If possible make the name obvious which platform/client it belongs to. For exemple : ClientName-Api-Server
ORGAN_TYPE="api-server"                       # You can keep this as is. Used by monitoring platform to categorize the organs.
```

## Running the API Server
``` bash
npm run start
# or with pm2 :
pm2 start index.js --name spinal-organ-api-server
# Prefer using a name that uncludes the port of the hub it connects to for exemple : 
pm2 start index.js --name api-server-10100
# If you want to have color theme in the logs ( pm2 log [processId] ) you can add the option --color
pm2 start index.js --name api-server-10100 -- --color
```



