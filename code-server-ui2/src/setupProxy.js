const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/containers',
    createProxyMiddleware({
      target: 'http://localhost:2375',
      changeOrigin: true,
      onError(err, req, res) {
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Something went wrong. And we are reporting a custom error message.' + err);
      },
      onProxyReq(proxyReq, req, res) {
        if (req.method == 'POST' && req.body) {
          console.log(req.body);
          proxyReq.write(req.body);
          proxyReq.end();
        }
      },
    })
  );
 
  app.use(
    '^/db',
    createProxyMiddleware({
	target: 'http://127.0.0.1:3001',
      secure: false,
      changeOrigin: false,
      onError(err, req, res) {
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Something went wrong. And we are reporting a custom error message.' + err);
      },

      onProxyReq(proxyReq, req, res) {
        if (req.method == 'POST' && req.body) {
          console.log(req.body);
          proxyReq.write(req.body);
          proxyReq.end();
        }
      },
    })
  );
};
