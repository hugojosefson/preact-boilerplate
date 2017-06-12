const isProduction = require('is-production');

const port = parseInt(process.env.PORT, 10) || 8080;
const actualServerPort = isProduction() ? port : port + 1;

module.exports = {
    // The port the user connects to
    port,

    // The port the server should actually listen to.
    actualServerPort
};

