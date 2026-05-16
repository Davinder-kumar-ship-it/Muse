'use strict';
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// In-memory user store — seeded from authorization.json at startup.
// On Vercel, the filesystem is read-only at runtime, so new users are
// kept in memory for the lifetime of the serverless function instance.
let userDb = null;

function loadDb() {
  if (userDb) return userDb;
  try {
    const filepath = path.join(__dirname, '..', 'data', 'authorization.json');
    const raw = fs.readFileSync(filepath, 'utf8');
    userDb = JSON.parse(raw);
  } catch (e) {
    userDb = [];
  }
  return userDb;
}

const scrypt = (password, randomSalt) => {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, randomSalt, 64, (err, hash) => {
      if (err) reject(err);
      resolve(hash.toString('hex'));
    });
  });
};

const createHashWithSalt = async (password) => {
  const randomSalt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, randomSalt);
  return `${randomSalt}:${hash}`;
};

async function main(userRequestData) {
  const dataIntoJson = loadDb();

  for (let item of dataIntoJson) {
    if (item.username === userRequestData.username) {
      return false; // username already exists
    }
  }

  const hashingWithSalt = await createHashWithSalt(userRequestData.password);
  const newUser = { username: userRequestData.username, password: hashingWithSalt };
  dataIntoJson.push(newUser);

  // Try to persist to disk (works locally; silently skipped on Vercel read-only fs)
  try {
    const filepath = path.join(__dirname, '..', 'data', 'authorization.json');
    fs.writeFileSync(filepath, JSON.stringify(dataIntoJson), 'utf8');
  } catch (e) {
    // On Vercel the filesystem is read-only — new user is held in memory only
    console.warn('Note: Could not persist user to disk (read-only filesystem). User stored in memory.');
  }

  return true;
}

module.exports = main;
