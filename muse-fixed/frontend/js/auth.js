'use strict';

// Auto-detect base URL so this works on any deployment (local or Vercel)
const API = window.location.origin;

// ── Tab switching ────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.form-box').forEach(function(f) { f.classList.remove('active'); });
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
    clearMessages();
  });
});

function clearMessages() {
  ['loginError','registerError','registerSuccess'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

// ── Login ────────────────────────────────────────────────────────────────────
document.getElementById('loginBtn').addEventListener('click', async function() {
  var username = document.getElementById('loginUsername').value.trim();
  var password = document.getElementById('loginPassword').value;
  var errorEl  = document.getElementById('loginError');
  var btn      = document.getElementById('loginBtn');

  errorEl.textContent = '';

  if (!username || !password) {
    errorEl.textContent = 'Please fill in all fields.';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Signing in...';

  try {
    var res  = await fetch(API + '/login', {
      method  : 'POST',
      headers : { 'content-type': 'application/json' },
      body    : JSON.stringify({ username: username, password: password })
    });
    var data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token',    data.token);
      localStorage.setItem('username', data.username || username);
      window.location.href = '/dashboard';
    } else {
      errorEl.textContent = data.error || 'Login failed. Please try again.';
    }
  } catch (err) {
    errorEl.textContent = 'Cannot connect to server. Is it running?';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Sign In';
  }
});

// ── Register ─────────────────────────────────────────────────────────────────
document.getElementById('registerBtn').addEventListener('click', async function() {
  var username   = document.getElementById('regUsername').value.trim();
  var password   = document.getElementById('regPassword').value;
  var errorEl    = document.getElementById('registerError');
  var successEl  = document.getElementById('registerSuccess');
  var btn        = document.getElementById('registerBtn');

  errorEl.textContent   = '';
  successEl.textContent = '';

  if (!username || !password) {
    errorEl.textContent = 'Please fill in all fields.';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters.';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Creating account...';

  try {
    var res  = await fetch(API + '/signup', {
      method  : 'POST',
      headers : { 'content-type': 'application/json' },
      body    : JSON.stringify({ username: username, password: password })
    });
    var data = await res.json();

    if (res.ok) {
      successEl.textContent = 'Account created! You can now sign in.';
      document.getElementById('regUsername').value = '';
      document.getElementById('regPassword').value = '';
    } else {
      errorEl.textContent = data.error || 'Registration failed.';
    }
  } catch (err) {
    errorEl.textContent = 'Cannot connect to server. Is it running?';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Create Account';
  }
});

// ── Enter key support ────────────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  var active = document.querySelector('.form-box.active');
  if (!active) return;
  if (active.id === 'loginForm')    document.getElementById('loginBtn').click();
  if (active.id === 'registerForm') document.getElementById('registerBtn').click();
});

// ── Redirect if already logged in ───────────────────────────────────────────
if (localStorage.getItem('token')) {
  window.location.href = '/dashboard';
}
