'use strict';
const tokenization = require('../controllers/tokenProvide.js');
const readFile     = require('../fileHandler/readFileOfUser.js');

// ── Logout handler (PATCH /logout) ──────────────────────────────────────────
const patch = (req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data  = JSON.parse(body);
      const valid = tokenization.checkingToken(data);

      if (valid) {
        tokenization.removeFromActiveSession(data);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 200, message: 'Logged out successfully' }));
      } else {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 401, error: 'Invalid or expired token' }));
      }
    } catch (err) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 400, error: 'Invalid request body' }));
    }
  });
};

// ── Helper: build a friendly message per mood ────────────────────────────────
// CHANGE: switch replaces if-else chain for mood message selection
function getMoodMessage(mood) {
  switch (mood) {
    case 'happy':   return 'Recommended happy song — enjoy the vibe!';
    case 'sad':     return 'Recommended sad song — let the words heal you.';
    case 'angry':   return 'Recommended angry song — let the fire speak.';
    case 'peaceful': return 'Recommended peaceful song — breathe and relax.';
    default:        return 'Recommended song for your mood.';
  }
}

// ── Main mood handler (POST /muse/alldata  OR  GET /happy|sad|angry|peaceful) ─
// mood parameter comes either from request body (POST) or is passed directly (GET)
async function handleMood(mood, res) {
  // CHANGE: switch validates mood instead of if-else + includes()
  switch (mood) {
    case 'happy':
    case 'sad':
    case 'angry':
    case 'peaceful':
      break; // valid — continue below
    default:
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        status : 400,
        error  : 'Invalid mood. Allowed values: happy, sad, angry, peaceful'
      }));
      return;
  }

  try {
    const rawData   = await readFile(mood);
    const allSongs  = JSON.parse(rawData);

    // Pick a random song from the mood list
    const entry = allSongs[Math.floor(Math.random() * allSongs.length)];

    // CHANGE: response now includes song, artist, youtubeLink, message
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      status      : 200,
      mood        : mood,
      song        : entry.song,
      artist      : entry.artist,
      youtubeLink : entry.youtubeLink,
      message     : getMoodMessage(mood),
      // extra details (language, theme, lyric snippet) kept for frontend display
      details: {
        id       : entry.id,
        text     : entry.text,
        language : entry.language,
        theme    : entry.theme
      }
    }));
  } catch (err) {
    console.error('Mood data read error:', err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 500, error: 'Failed to load mood data' }));
  }
}

// ── POST /muse/alldata — token-protected endpoint ────────────────────────────
const post = (req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data  = JSON.parse(body);
      const valid = tokenization.checkingToken(data);

      if (!valid) {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          status : 401,
          error  : 'Invalid or expired token. Please log in again.'
        }));
        return;
      }

      // Delegate to shared handleMood function
      handleMood(data.mood, res);

    } catch (err) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 400, error: 'Invalid request body' }));
    }
  });
};

module.exports = { post, patch, handleMood };
