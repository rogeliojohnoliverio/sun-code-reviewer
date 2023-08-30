import { createNodeMiddleware, createProbot } from 'probot';

import { Bot as app } from '../../../src/bot';

const probot = createProbot();

export default createNodeMiddleware(app, {
  probot,
  webhooksPath: '/api/github/webhooks',
});
