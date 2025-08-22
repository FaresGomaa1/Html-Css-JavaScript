(function() {
  'use strict';

  const STORAGE_KEY = 'learnhub_auth_user';

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  function saveUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function signIn({ email, password }) {
    if (!email || !password) throw new Error('Email and password are required');
    const existing = getUsersIndex()[email.toLowerCase()];
    if (!existing) throw new Error('Account not found');
    if (existing.password !== password) throw new Error('Invalid credentials');
    const user = { email: existing.email, name: existing.name || existing.email.split('@')[0] };
    saveUser(user);
    return user;
  }

  function signUp({ name, email, password }) {
    if (!name || !email || !password) throw new Error('All fields are required');
    const idx = getUsersIndex();
    const key = email.toLowerCase();
    if (idx[key]) throw new Error('Email already registered');
    idx[key] = { email, name, password };
    localStorage.setItem('learnhub_users', JSON.stringify(idx));
    const user = { email, name };
    saveUser(user);
    return user;
  }

  function signOut() { clearUser(); }

  function getUsersIndex() {
    try {
      const raw = localStorage.getItem('learnhub_users');
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }

  function renderNavControls() {
    const nav = document.querySelector('.site-nav .nav-links');
    if (!nav) return;

    let controls = nav.querySelector('[data-auth-controls]');
    if (!controls) {
      controls = document.createElement('li');
      controls.setAttribute('data-auth-controls', '');
      nav.appendChild(controls);
    }

    const user = getCurrentUser();
    if (user) {
      controls.innerHTML = `
        <span class="muted" style="margin-right: .5rem;">Hi, ${escapeHtml(user.name)}</span>
        <a href="course.html" style="display:none"></a>
        <a href="signin.html" style="display:none"></a>
        <button class="btn-secondary" id="signOutBtn">Sign out</button>
      `;
      const btn = controls.querySelector('#signOutBtn');
      if (btn) btn.addEventListener('click', () => {
        signOut();
        renderNavControls();
      });
    } else {
      controls.innerHTML = `
        <a href="signin.html" class="btn-secondary">Sign in</a>
        <a href="signup.html" class="btn-primary" style="margin-left:.5rem;">Sign up</a>
      `;
    }
  }

  function requireAuth(redirectTo) {
    if (!getCurrentUser()) {
      window.location.href = redirectTo || 'signin.html';
      return false;
    }
    return true;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s]));
  }

  window.Auth = {
    getCurrentUser,
    signIn,
    signUp,
    signOut,
    renderNavControls,
    requireAuth
  };
})();