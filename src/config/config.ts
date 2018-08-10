import * as nconf from 'nconf';

let config = nconf.argv().env().file({ file: `config/config.json` });

export default config;
