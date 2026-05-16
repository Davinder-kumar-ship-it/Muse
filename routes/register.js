'use strict';
const checkingUserExists = require('../controllers/registerHashingAndSalt');

const post = (req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);

      if (!data.username || !data.password) {
        res.writeHead(400, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ status: 400, error: 'Username and password are required' }));
      }

      if (data.password.length < 6) {
        res.writeHead(400, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ status: 400, error: 'Password must be at least 6 characters' }));
      }

      checkingUserExists(data).then(status => {
        if (status) {
          res.writeHead(201, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ status: 201, message: 'Account created successfully' }));
        } else {
          res.writeHead(409, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ status: 409, error: 'Username already exists' }));
        }
      }).catch(err => {
        console.error('Register error:', err);
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 500, error: 'Internal server error' }));
      });
    } catch (err) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 400, error: 'Invalid request body' }));
    }
  });
};

module.exports = { post };
