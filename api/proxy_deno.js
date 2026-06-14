// OpenAI API Proxy for Deno Deploy
// Deploy to https://dash.deno.com
// 比 Vercel 版本更简单，不需要任何配置

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const targetUrl = "https://api.openai.com" + url.pathname + url.search;

  const headers = new Headers(req.headers);
  headers.set("host", "api.openai.com");
  headers.set("Access-Control-Allow-Origin", "*");

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
    });

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
