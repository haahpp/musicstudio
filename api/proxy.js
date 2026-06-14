// 透明 OpenAI API 代理
// 所有请求原样转发到 api.openai.com，不改任何数据

const https = require('https');
const http = require('http');

module.exports = async (req, res) => {
  // 请求的完整路径（含 query）
  const path = req.url;
  const targetHost = 'api.openai.com';

  // 如果是预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(200).end();
    return;
  }

  const options = {
    hostname: targetHost,
    path: path,
    method: req.method,
    headers: { ...req.headers, host: targetHost },
  };

  // 创建到 OpenAI 的请求
  const proxyReq = https.request(options, (proxyRes) => {
    // 转发状态码
    res.statusCode = proxyRes.statusCode;
    
    // 转发响应头（排除 transfer-encoding 避免冲突）
    const excludeHeaders = ['transfer-encoding', 'connection'];
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 流式转发响应体（支持 SSE 和二进制音频）
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  // 转发请求体（JSON 或二进制）
  req.pipe(proxyReq);
};
