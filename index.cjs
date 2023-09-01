require('./fetch-polyfill.cjs');
const { run } = require('@probot/adapter-github-actions');
const { Bot } = require('./src/bot');

run(Bot);
