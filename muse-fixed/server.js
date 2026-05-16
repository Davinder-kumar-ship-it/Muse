'use strict';

const http = require('http');
const url  = require('url');
const path = require('path');
const fs   = require('fs');

const register      = require('./routes/register.js');
const userExist     = require('./controllers/userExist.js');
const activeSession = require('./controllers/tokenIsValid.js');

const PORT = process.env.PORT || 8000;

// Supported file types for static serving
const MIME = {
  '.html': 'text/html',
  '.css' : 'text/css',
  '.js'  : 'text/javascript',
  '.json': 'application/json',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.svg' : 'image/svg+xml',
  '.ico' : 'image/x-icon',
};

// ── Serve static files from /frontend folder ─────────────────────────────────
function serveStatic(res, relPath) {
  const fullPath = path.join(__dirname, 'frontend', relPath);
  const ext      = path.extname(fullPath);
  const mime     = MIME[ext] || 'application/octet-stream';
  const encoding = mime.startsWith('image/') ? null : 'utf8';

  fs.readFile(fullPath, encoding, (err, data) => {
    if (err) {
      sendJSON(res, 404, { status: 404, error: 'File not found' });
      return;
    }
    res.writeHead(200, { 'content-type': mime });
    res.end(data);
  });
}

// ── Helper: send a JSON response ─────────────────────────────────────────────
function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

// ── Main server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method   = req.method;

  console.log('[' + method + '] ' + pathname);

  try {
    // ── CHANGE: switch replaces the long if-else routing chain ──────────────

    // Static asset routes (css/js/image) — handled before switch
    if (method === 'GET' && (
      pathname.startsWith('/css/')   ||
      pathname.startsWith('/js/')    ||
      pathname.startsWith('/image/')
    )) return serveStatic(res, pathname);

    if (pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }

    // Route dispatch using switch
    switch (true) {

      // ── Frontend pages ───────────────────────────────────────────────────
      case method === 'GET' && pathname === '/':
        return serveStatic(res, 'index.html');

      case method === 'GET' && pathname === '/dashboard':
        return serveStatic(res, 'dashboard.html');

      case method === 'GET' && pathname === '/docs':
        return serveStatic(res, 'docs.html');

      // ── Auth routes ──────────────────────────────────────────────────────
      case method === 'POST' && pathname === '/signup':
        return register.post(req, res);

      case method === 'POST' && pathname === '/login':
        return userExist.post(req, res);

      case method === 'PATCH' && pathname === '/logout':
        return activeSession.patch(req, res);

      // ── Token-protected mood route (all moods, POST body) ────────────────
      case method === 'POST' && pathname === '/muse/alldata':
        return activeSession.post(req, res);

      // ── CHANGE: Individual mood GET endpoints ────────────────────────────
      // Each mood has its own URL. No token needed — public endpoints.
      // Returns: { mood, song, artist, youtubeLink, message, details }
      case method === 'GET' && pathname === '/happy':
        return activeSession.handleMood('happy', res);

      case method === 'GET' && pathname === '/sad':
        return activeSession.handleMood('sad', res);

      case method === 'GET' && pathname === '/angry':
        return activeSession.handleMood('angry', res);

      case method === 'GET' && pathname === '/peaceful':
        return activeSession.handleMood('peaceful', res);

      // ── API info endpoint ─────────────────────────────────────────────────
      case method === 'GET' && pathname === '/api/moods':
        return sendJSON(res, 200, {
          status    : 200,
          moods     : ['happy', 'sad', 'angry', 'peaceful'],
          endpoints : {
            public   : 'GET  /happy  |  /sad  |  /angry  |  /peaceful',
            protected: 'POST /muse/alldata  body: { "token": "<token>", "mood": "<mood>" }'
          },
          auth: 'Login via POST /login to receive a token'
        });

      // ── 404 fallback ──────────────────────────────────────────────────────
      default:
        sendJSON(res, 404, {
          status : 404,
          error  : 'Route not found',
          path   : pathname
        });
    }

  } catch (err) {
    console.error('Server error:', err);
    sendJSON(res, 500, { status: 500, error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log('\n  MUSE API  ->  http://localhost:' + PORT);
  console.log('  Docs      ->  http://localhost:' + PORT + '/docs');
  console.log('\n  Mood endpoints (public):');
  console.log('    GET /happy | /sad | /angry | /peaceful\n');
});
