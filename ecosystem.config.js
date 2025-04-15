require("dotenv").config();

const mode = process.env.PM2_MODE || 'fork';
const instances = mode === 'cluster' ? process.env.PM2_INSTANCES || 'max' : 1;

module.exports = {
  apps: [
    {
      name: `spinal-api-server-${ process.env.REQUESTS_PORT}-${process.env.SPINALHUB_PORT}`,
      script: "index.js",
      exec_mode: mode,
      instances: instances,
      cwd: ".",
      args: [
  
      ],
    },
  ],
};


