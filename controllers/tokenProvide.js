'use strict';
const crypto = require('crypto');

// ── Stateless HMAC token — works on Vercel serverless (no shared memory) ──
// Token format:  base64(username):base64(timestamp):hmac_signature
// No in-memory store needed — signature verifies authenticity.

const SECRET = process.env.TOKEN_SECRET || 'muse-default-secret-change-in-prod';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sign(payload) {
  return crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');
}

const token = (receivedObject) => {
  const username  = receivedObject.username;
  const timestamp = Date.now().toString();
  const b64user   = Buffer.from(username).toString('base64');
  const b64ts     = Buffer.from(timestamp).toString('base64');
  const payload   = `${b64user}:${b64ts}`;
  const sig       = sign(payload);
  const tokenStr  = `${payload}:${sig}`;
  return { token: tokenStr };
};

const checkingToken = (tokenDataInJson) => {
  try {
    const tokenStr = tokenDataInJson.token;
    if (!tokenStr) return false;

    const parts = tokenStr.split(':');
    if (parts.length !== 3) return false;

    const [b64user, b64ts, sig] = parts;
    const payload = `${b64user}:${b64ts}`;

    // Verify signature
    const expectedSig = sign(payload);
    const a = Buffer.from(sig,         'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;

    // Check expiry
    const timestamp = parseInt(Buffer.from(b64ts, 'base64').toString(), 10);
    if (Date.now() - timestamp > TTL_MS) return false;

    return true;
  } catch (e) {
    return false;
  }
};

// Logout is a no-op with stateless tokens (client just discards the token).
// For server-side revocation a DB/KV store would be needed.
const removeFromActiveSession = (_tokenDataInJson) => {
  return { message: 'successfully logged out' };
};

module.exports = { token, checkingToken, removeFromActiveSession };
