const routes = (handler) => [
  {
    method: 'POST',
    path: '/llms',
    handler: handler.postLLMHandler,
    options: {
      auth: 'ecommerce_app',
    },
  },
];

module.exports = routes;
