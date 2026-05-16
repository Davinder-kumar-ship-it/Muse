'use strict';
const crypto       = require('crypto');
const readFile     = require('../fileHandler/readFileOfUser.js');
const tokenization = require('../controllers/tokenProvide.js');

// verify a scrypt hash in the format "salt:hash"
function verifyPassword(inputPassword, storedHash) {
  return new Promise((resolve, reject) => {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return resolve(false);
    crypto.scrypt(inputPassword, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      const inputHash = derivedKey.toString('hex');
      // constant-time compare to prevent timing attacks
      try {
        const a = Buffer.from(inputHash, 'hex');
        const b = Buffer.from(hash, 'hex');
        if (a.length !== b.length) return resolve(false);
        resolve(crypto.timingSafeEqual(a, b));
      } catch (e) {
        resolve(false);
      }
    });
  });
}

const post = (req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { username, password } = JSON.parse(body);

      if (!username || !password) {
        res.writeHead(400, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ status: 400, error: 'Username and password are required' }));
      }

      const userFile     = await readFile('authorization');
      const userFileJson = JSON.parse(userFile);

      let matchedUser = null;
      for (const user of userFileJson) {
        if (user.username === username) { matchedUser = user; break; }
      }

      if (!matchedUser) {
        res.writeHead(401, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ status: 401, error: 'Invalid username or password' }));
      }

      const valid = await verifyPassword(password, matchedUser.password);
      if (!valid) {
        res.writeHead(401, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ status: 401, error: 'Invalid username or password' }));
      }

      const tokenData = tokenization.token({ username });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 200, ...tokenData, username }));

    } catch (err) {
      console.error('Login error:', err);
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 500, error: 'Internal server error' }));
    }
  });
};

module.exports = { post };
