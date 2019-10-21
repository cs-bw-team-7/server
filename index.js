require('dotenv').config();

const log = require('./utils/logger');
const server = require('./api/server');
const port = process.env.PORT || 4444;
server.listen(port, () => log.info(`Server listening on port ${port}`));