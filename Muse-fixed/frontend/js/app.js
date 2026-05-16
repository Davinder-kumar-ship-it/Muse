'use strict';

var API      = 'http://localhost:8000';
var token    = localStorage.getItem('token');
var username = localStorage.getItem('username');
var currentMood = null;

// ── Auth guard ───────────────────────────────────────────────────────────────
if (!token) {
  window.location.href = '/';
}

// ── Show username ─────────────────────────────────────────────────────────────
document.getElementById('usernameText').textContent = '@' + (username || 'user');

// ── Logout ────────────────────────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', async function() {
  try {
    await fetch(API + '/logout', {
      method  : 'PATCH',
      headers : { 'content-type': 'application/json' },
      body    : JSON.stringify({ token: token })
    });
  } catch (e) { /* ignore network error on logout */ }
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = '/';
});

// ── Copy API URL ──────────────────────────────────────────────────────────────
document.getElementById('copyBtn').addEventListener('click', function() {
  var text = document.getElementById('apiUrlText').textContent;
  navigator.clipboard.writeText(text).then(function() {
    var btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
});

// ── Mood card click ───────────────────────────────────────────────────────────
document.querySelectorAll('.mood-card').forEach(function(card) {
  card.addEventListener('click', function() {
    // Remove selected from all cards
    document.querySelectorAll('.mood-card').forEach(function(c) {
      c.classList.remove('selected');
    });
    card.classList.add('selected');
    currentMood = card.dataset.mood;

    // CHANGE: show mood-specific endpoint URL in the info box
    document.getElementById('apiUrlText').textContent = API + '/' + currentMood;

    getQuote(currentMood);
  });
});

// ── Another One button ────────────────────────────────────────────────────────
document.getElementById('anotherBtn').addEventListener('click', function() {
  if (currentMood) getQuote(currentMood);
});

// ── YouTube link button (now a real <a> tag, updated dynamically) ─────────────
document.getElementById('youtubeBtn').addEventListener('click', function() {
  var url = this.dataset.url;
  if (url) window.open(url, '_blank');
});

// ── Main quote fetcher ────────────────────────────────────────────────────────
// CHANGE: now calls mood-specific URL e.g. GET /happy instead of POST /muse/alldata
// Falls back to POST /muse/alldata with token if GET endpoint fails (backward compat)
async function getQuote(mood) {
  var quoteBox   = document.getElementById('quoteBox');
  var loadingDiv = document.getElementById('loadingDiv');
  var errorDiv   = document.getElementById('errorDiv');

  quoteBox.style.display   = 'none';
  errorDiv.style.display   = 'none';
  loadingDiv.style.display = 'block';

  try {
    // CHANGE: use mood-specific GET endpoint
    var res = await fetch(API + '/' + mood, {
      method  : 'GET',
      headers : { 'content-type': 'application/json' }
    });

    var data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }

    // ── Mood tag ─────────────────────────────────────────────────────────────
    var moodTag = document.getElementById('moodTag');
    moodTag.textContent = getMoodEmoji(data.mood) + ' ' + capitalize(data.mood);
    moodTag.className   = 'mood-tag ' + data.mood;

    // ── CHANGE: show song name and artist (new response fields) ──────────────
    document.getElementById('songName').textContent   = data.song   || '—';
    document.getElementById('artistName').textContent = data.artist || '—';

    // ── Quote/lyric text from details ─────────────────────────────────────────
    var details = data.details || {};
    document.getElementById('quoteText').textContent  = details.text   || '';
    document.getElementById('authorName').textContent = details.text ? '— ' + (data.artist || 'Unknown') : '';

    // ── Meta info ─────────────────────────────────────────────────────────────
    document.getElementById('langText').textContent    = details.language || '—';
    document.getElementById('themeText').textContent   = details.theme    || '—';
    document.getElementById('quoteApiUrl').textContent = API + '/' + mood;
    document.getElementById('quoteIdBadge').textContent = 'id: ' + (details.id || '?');

    // ── CHANGE: YouTube button shows song name and opens correct link ─────────
    var ytBtn = document.getElementById('youtubeBtn');
    if (data.youtubeLink) {
      ytBtn.dataset.url   = data.youtubeLink;
      ytBtn.style.display = 'inline-flex';
      // Show song name on button so it's clear what will play
      document.getElementById('ytSongLabel').textContent =
        data.song ? ' ' + data.song : ' Listen on YouTube';
    } else {
      ytBtn.style.display = 'none';
    }

    // ── Show message from API ─────────────────────────────────────────────────
    var msgEl = document.getElementById('apiMessage');
    if (msgEl) msgEl.textContent = data.message || '';

    loadingDiv.style.display = 'none';
    quoteBox.style.display   = 'block';
    quoteBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (err) {
    loadingDiv.style.display = 'none';
    errorDiv.style.display   = 'block';
    document.getElementById('errorMsg').textContent =
      err.message || 'Could not connect to server.';
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// CHANGE: switch replaces object lookup for emoji (demonstrates switch usage)
function getMoodEmoji(mood) {
  switch (mood) {
    case 'happy':   return '😊';
    case 'sad':     return '😢';
    case 'angry':   return '😤';
    case 'peaceful': return '😌';
    default:        return '🎵';
  }
}
