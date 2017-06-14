// This script is run on Heroku, to check that you have configured the Heroku app correctly.

const isNotYetConfigured = ([property, expectedValue]) => process.env[property] !== expectedValue;

const missingConfig = [
    ['NODE_ENV', 'development'],
    ['NPM_CONFIG_PRODUCTION', 'false']
]
    .filter(isNotYetConfigured);

if (missingConfig.length) {
    console.error();
    console.error('For Heroku to let us have devDependencies during the build, you must configure the environment:');
    missingConfig.forEach(([property, expectedValue]) => {
        console.error(`$ heroku config:set ${property}=${expectedValue}`);
    });
    console.error();
    console.error();
    console.error();
    console.error();
    process.exit(1);
}
