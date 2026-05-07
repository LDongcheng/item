/**
 * API 代理中间件 - 转发前端请求到第三方 API，解决浏览器 CORS 限制
 * 启动：node proxy.js
 * 端口：3000
 */
var http = require('http');
var url = require('url');

var PORT = 3000;

var server = http.createServer(function (req, res) {
  var parsedUrl = url.parse(req.url, true);
  var pathname = parsedUrl.pathname;

  // 代理路由
  if (pathname === '/api/quick-reply' && req.method === 'POST') {
    proxyRequest(req, res, {
      host: 'coding.dashscope.aliyuncs.com',
      path: '/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-sp-385035c0f01148548165845d5ca6c400'
      }
    });
    return;
  }

  // 默认返回静态文件（如果需要的话）
  res.writeHead(404);
  res.end('Not found');
});

/**
 * 代理请求
 */
function proxyRequest(req, res, options) {
  var body = '';
  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    var reqOptions = {
      hostname: options.host,
      path: options.path,
      method: 'POST',
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }, options.headers)
    };

    var proxyReq = require('https').request(reqOptions, function (proxyRes) {
      // 设置 CORS 头
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // 如果客户端发的是 OPTIONS 预检请求
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      res.writeHead(proxyRes.statusCode);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', function (err) {
      console.error('[Proxy] Request error:', err.message);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(502);
      res.end(JSON.stringify({ error: 'Proxy request failed', message: err.message }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
}

// 处理 OPTIONS 预检
server.on('request', function (req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(204);
    res.end();
  }
});

server.listen(PORT, function () {
  console.log('[Proxy] Server running on http://localhost:' + PORT);
  console.log('[Proxy] Quick reply proxy -> https://coding.dashscope.aliyuncs.com/v1/chat/completions');
});
