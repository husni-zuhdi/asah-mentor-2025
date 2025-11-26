const LLMsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'llms',
  version: '1.0.0',
  register: async (server, { service }) => {
    const llmsHandler = new LLMsHandler(service);
    server.route(routes(llmsHandler));
  },
};
