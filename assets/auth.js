/*
 * auth.js — simple client-side authentication for LearnHub demo site.
 * Stores a single user record in localStorage (key: "learnhubUser") and a login flag ("learnhubLoggedIn").
 * Provides helpers to sign up, sign in, sign out, and to update the header navigation links.
 */
(function() {
  'use strict';

  // Public helpers attached to window for reuse across pages.
  const auth = {
    getUser() {
      try {
        return JSON.parse(localStorage.getItem('learnhubUser') || 'null');
      } catch (_) {
        return null;
      }
    },
    isLoggedIn() {
      return localStorage.getItem('learnhubLoggedIn') === 'true';
    },
    signUp(data) {
      // data: { name, email, password }
      localStorage.setItem('learnhubUser', JSON.stringify(data));
      localStorage.setItem('learnhubLoggedIn', 'true');
    },
    signIn(email, password) {
      const user = auth.getUser();
      if (user && user.email === email && user.password === password) {
        localStorage.setItem('learnhubLoggedIn', 'true');
        return true;
      }
      return false;
    },
    signOut() {
      localStorage.removeItem('learnhubLoggedIn');
    }
  };

  window.learnhubAuth = auth;

  document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    attachHandlersForAuthPages();
  });

  function updateNav() {
    const navLink = document.getElementById('authLink');
    if (!navLink) return; // page may not have nav

    navLink.innerHTML = '';
    if (auth.isLoggedIn()) {
      const signOutBtn = document.createElement('button');
      signOutBtn.textContent = 'Sign out';
      signOutBtn.className = 'btn-text';
      signOutBtn.addEventListener('click', () => {
        auth.signOut();
        window.location.href = 'index.html';
      });
      navLink.appendChild(signOutBtn);
    } else {
      const signInLink = document.createElement('a');
      signInLink.href = 'signin.html';
      signInLink.textContent = 'Sign in';
      navLink.appendChild(signInLink);
    }
  }

  function attachHandlersForAuthPages() {
    const path = window.location.pathname.replace(/\/$/, '').split('/').pop();

    if (path === 'signup.html') {
      const form = document.getElementById('signupForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const name = formData.get('name').trim();
          const email = formData.get('email').trim();
          const password = formData.get('password');
          if (!name || !email || !password) return alert('Please fill all fields');
          auth.signUp({ name, email, password });
          window.location.href = 'index.html';
        });
      }
    } else if (path === 'signin.html') {
      const form = document.getElementById('signinForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const email = formData.get('email').trim();
          const password = formData.get('password');
          if (auth.signIn(email, password)) {
            window.location.href = 'index.html';
          } else {
            alert('Invalid credentials');
          }
        });
      }
    }
  }
})();