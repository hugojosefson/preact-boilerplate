const babelConfig = require('./package.json').babel;
require('babel-core/register')(babelConfig);

if (require('is-production')() || require('piping')()) {
    try {
        require('./src/server');
    } catch (error) {
        console.error(error.stack);
    }
}
