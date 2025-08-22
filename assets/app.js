(function() {
  'use strict';

  const state = {
    courses: [],
    filtered: [],
    query: '',
    category: 'all',
    level: 'all',
    sort: 'popular',
    user: null
  };

  const els = {};

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    hydrateInitialData();
    wireHeaderNav();
    wireFilters();
    renderYear();
    initAuth();
    initRouter();
  });

  function cacheElements() {
    els.grid = document.getElementById('coursesGrid');
    els.results = document.getElementById('resultsCount');
    els.search = document.getElementById('searchInput');
    els.category = document.getElementById('categorySelect');
    els.level = document.getElementById('levelSelect');
    els.sort = document.getElementById('sortSelect');
    els.clear = document.getElementById('clearFilters');
    els.modal = document.getElementById('courseModal');
    els.modalBackdrop = els.modal.querySelector('.modal-backdrop');
    els.modalDialog = els.modal.querySelector('.modal-dialog');
    els.modalClose = els.modal.querySelector('.modal-close');
    els.modalImage = document.getElementById('modalImage');
    els.modalTitle = document.getElementById('modalTitle');
    els.modalDesc = document.getElementById('modalDesc');
    els.modalInstructor = document.getElementById('modalInstructor');
    els.modalLevel = document.getElementById('modalLevel');
    els.modalDuration = document.getElementById('modalDuration');
    els.modalTags = document.getElementById('modalTags');
    els.modalCta = document.getElementById('modalCta');
    els.navAuth = document.getElementById('navAuth');
    els.homeView = document.getElementById('homeView');
    els.routeView = document.getElementById('routeView');
  }

  function hydrateInitialData() {
    state.courses = getSeedCourses();
    populateCategoryOptions(state.courses);
    applyFilters();
  }

  function wireHeaderNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function wireFilters() {
    const debouncedSearch = debounce((value) => {
      state.query = value.trim().toLowerCase();
      applyFilters();
    }, 120);

    els.search.addEventListener('input', (e) => debouncedSearch(e.target.value));

    els.category.addEventListener('change', (e) => {
      state.category = e.target.value;
      applyFilters();
    });
    els.level.addEventListener('change', (e) => {
      state.level = e.target.value;
      applyFilters();
    });
    els.sort.addEventListener('change', (e) => {
      state.sort = e.target.value;
      applyFilters();
    });

    els.clear.addEventListener('click', () => {
      document.getElementById('searchForm').reset();
      state.query = '';
      state.category = 'all';
      state.level = 'all';
      state.sort = 'popular';
      applyFilters();
      els.search.focus();
    });

    els.grid.addEventListener('click', (e) => {
      const link = e.target.closest('[data-course-link]');
      if (link) {
        e.preventDefault();
        const courseId = link.getAttribute('data-course-link');
        navigateTo(`#/courses/${courseId}`);
        return;
      }
      const button = e.target.closest('[data-course-id]');
      if (button) {
        const courseId = button.getAttribute('data-course-id');
        const course = state.filtered.find((c) => String(c.id) === String(courseId)) || state.courses.find((c) => String(c.id) === String(courseId));
        if (course) openModal(course);
      }
    });

    // Close modal interactions
    els.modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]') || e.target === els.modalBackdrop) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !els.modal.hasAttribute('hidden')) closeModal();
    });
  }

  function populateCategoryOptions(courses) {
    const categories = Array.from(new Set(courses.map((c) => c.category))).sort();
    for (const cat of categories) {
      const opt = document.createElement('option');
      opt.value = cat.toLowerCase();
      opt.textContent = cat;
      els.category.appendChild(opt);
    }
  }

  function applyFilters() {
    const q = state.query;
    const cat = state.category;
    const lvl = state.level;

    let list = state.courses.filter((c) => {
      const matchesQuery = !q || (
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
      const matchesCat = cat === 'all' || c.category.toLowerCase() === cat;
      const matchesLevel = lvl === 'all' || c.level.toLowerCase() === lvl;
      return matchesQuery && matchesCat && matchesLevel;
    });

    list = sortCourses(list, state.sort);

    state.filtered = list;
    renderList(list);
    updateResults(list.length);
  }

  function sortCourses(list, mode) {
    const copy = [...list];
    switch (mode) {
      case 'rating':
        copy.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case 'new':
        copy.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        break;
      case 'durationAsc':
        copy.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
        break;
      case 'durationDesc':
        copy.sort((a, b) => parseDuration(b.duration) - parseDuration(a.duration));
        break;
      case 'popular':
      default:
        copy.sort((a, b) => b.students - a.students || b.rating - a.rating);
        break;
    }
    return copy;
  }

  function parseDuration(text) {
    // Supports formats like "3h 20m", "45m", "2h"
    let minutes = 0;
    const h = text.match(/(\d+)\s*h/);
    const m = text.match(/(\d+)\s*m/);
    if (h) minutes += parseInt(h[1], 10) * 60;
    if (m) minutes += parseInt(m[1], 10);
    return minutes;
  }

  function renderList(list) {
    els.grid.setAttribute('aria-busy', 'true');
    if (!list.length) {
      els.grid.innerHTML = emptyStateHTML();
      els.grid.setAttribute('aria-busy', 'false');
      return;
    }
    const html = list.map(courseCardHTML).join('');
    els.grid.innerHTML = html;
    els.grid.setAttribute('aria-busy', 'false');
  }

  function courseCardHTML(course) {
    const imgUrl = course.image || `https://picsum.photos/seed/${encodeURIComponent(course.id)}/800/450`;
    return `
      <article class="card" tabindex="0">
        <div class="card-media">
          <img src="${imgUrl}" alt="${escapeHtml(course.title)} thumbnail" loading="lazy" width="800" height="450" />
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(course.title)}</h3>
          <div class="card-meta">
            <span>⭐ ${course.rating.toFixed(1)} (${formatNumber(course.reviews)})</span>
            <span>👤 ${escapeHtml(course.instructor)}</span>
            <span>⏱️ ${course.duration}</span>
            <span>🏷️ ${escapeHtml(course.level)}</span>
          </div>
          <div class="tags">${course.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
          <div class="card-actions">
            <span class="muted">${formatNumber(course.students)} learners</span>
            <a class="view-btn" href="#/courses/${course.id}" data-course-link="${course.id}">View details</a>
          </div>
        </div>
      </article>
    `;
  }

  function emptyStateHTML() {
    return `
      <div class="card" style="padding: 1rem; text-align: center;">
        <p class="muted">No courses match your filters. Try a different search.</p>
      </div>
    `;
  }

  function updateResults(count) {
    els.results.textContent = `${count} course${count === 1 ? '' : 's'} found`;
  }

  function openModal(course) {
    els.modalImage.src = course.image || `https://picsum.photos/seed/${encodeURIComponent(course.id)}/1200/800`;
    els.modalImage.alt = `${course.title} image`;
    els.modalTitle.textContent = course.title;
    els.modalDesc.textContent = course.description;
    els.modalInstructor.textContent = `Instructor: ${course.instructor}`;
    els.modalLevel.textContent = `Level: ${course.level}`;
    els.modalDuration.textContent = `Duration: ${course.duration}`;
    els.modalTags.innerHTML = course.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('');
    els.modalCta.href = course.url || '#';

    showModal();
  }

  let lastFocusedElement = null;
  function showModal() {
    lastFocusedElement = document.activeElement;
    els.modal.removeAttribute('hidden');
    els.modal.setAttribute('aria-hidden', 'false');
    trapFocus(els.modalDialog);
  }

  function closeModal() {
    els.modal.setAttribute('aria-hidden', 'true');
    els.modal.setAttribute('hidden', '');
    releaseFocusTrap();
    if (lastFocusedElement && lastFocusedElement.focus) lastFocusedElement.focus();
  }

  // Focus trap
  let trapCleanup = null;
  function trapFocus(container) {
    const focusableSelectors = [
      'a[href]', 'button:not([disabled])', 'textarea', 'input', 'select', '[tabindex]:not([tabindex="-1"])'
    ];
    const getFocusable = () => Array.from(container.querySelectorAll(focusableSelectors.join(','))).filter((el) => el.offsetParent !== null || el === container);

    const onKeydown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    const focusFirst = () => {
      const focusable = getFocusable();
      const target = focusable.find((el) => el.getAttribute('data-close') !== 'true') || focusable[0];
      if (target && target.focus) target.focus();
    };

    document.addEventListener('keydown', onKeydown);
    focusFirst();

    trapCleanup = () => {
      document.removeEventListener('keydown', onKeydown);
      trapCleanup = null;
    };
  }

  function releaseFocusTrap() {
    if (typeof trapCleanup === 'function') trapCleanup();
  }

  // Utils
  function debounce(fn, ms) {
    let id;
    return function(...args) {
      clearTimeout(id);
      id = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function formatNumber(n) {
    return new Intl.NumberFormat().format(n);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"]+/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  function renderYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function getSeedCourses() {
    const lorem = (n) => (
      'Build practical skills with hands-on projects and modern best practices. '
      + 'This course guides you from fundamentals to real-world proficiency in just a few hours.'
    ).slice(0, n);

    return [
      { id: 1, title: 'Modern JavaScript Essentials', instructor: 'Ava Thompson', level: 'Beginner', category: 'Development', rating: 4.7, reviews: 1843, students: 40210, duration: '4h 20m', publishedAt: '2024-06-14', tags: ['JavaScript', 'ES2023', 'Frontend'], description: lorem(220), url: '#', image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop' },
      { id: 2, title: 'Responsive Web Design', instructor: 'Noah Patel', level: 'Beginner', category: 'Design', rating: 4.8, reviews: 2320, students: 51023, duration: '3h 10m', publishedAt: '2024-03-08', tags: ['CSS', 'Flexbox', 'Grid'], description: lorem(240), url: '#', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop' },
      { id: 3, title: 'React from Zero to Pro', instructor: 'Mia Chen', level: 'Intermediate', category: 'Development', rating: 4.9, reviews: 5210, students: 120432, duration: '6h 45m', publishedAt: '2025-01-02', tags: ['React', 'Hooks', 'SPA'], description: lorem(260), url: '#', image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1200&auto=format&fit=crop' },
      { id: 4, title: 'Data Visualization with Python', instructor: 'Oliver Smith', level: 'Intermediate', category: 'Data', rating: 4.6, reviews: 1803, students: 35012, duration: '5h 00m', publishedAt: '2024-11-20', tags: ['Python', 'Matplotlib', 'Pandas'], description: lorem(240), url: '#', image: 'https://images.unsplash.com/photo-1551281044-8f99e4490b8f?q=80&w=1200&auto=format&fit=crop' },
      { id: 5, title: 'Figma for UI Designers', instructor: 'Lucas Rivera', level: 'Beginner', category: 'Design', rating: 4.7, reviews: 980, students: 25120, duration: '2h 30m', publishedAt: '2023-10-10', tags: ['Figma', 'Prototyping', 'UI'], description: lorem(200), url: '#', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop' },
      { id: 6, title: 'Product Analytics Foundations', instructor: 'Sophia Nguyen', level: 'Beginner', category: 'Data', rating: 4.5, reviews: 743, students: 17820, duration: '2h 10m', publishedAt: '2024-05-01', tags: ['Analytics', 'A/B Testing', 'Metrics'], description: lorem(200), url: '#', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop' },
      { id: 7, title: 'Advanced TypeScript Patterns', instructor: 'Ethan Clark', level: 'Advanced', category: 'Development', rating: 4.9, reviews: 3120, students: 65012, duration: '7h 20m', publishedAt: '2024-12-08', tags: ['TypeScript', 'Generics', 'Architecture'], description: lorem(280), url: '#', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop' },
      { id: 8, title: 'SQL for Analysts', instructor: 'Emma Garcia', level: 'Beginner', category: 'Data', rating: 4.6, reviews: 2980, students: 80300, duration: '3h 45m', publishedAt: '2022-08-25', tags: ['SQL', 'Queries', 'Databases'], description: lorem(220), url: '#', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop' },
      { id: 9, title: 'UX Research Toolkit', instructor: 'William Brooks', level: 'Intermediate', category: 'Design', rating: 4.4, reviews: 600, students: 12980, duration: '2h 05m', publishedAt: '2023-04-18', tags: ['UX', 'Research', 'Interviews'], description: lorem(180), url: '#', image: 'https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d4?q=80&w=1200&auto=format&fit=crop' },
      { id: 10, title: 'Next.js for Full‑Stack Apps', instructor: 'Liam Johnson', level: 'Intermediate', category: 'Development', rating: 4.8, reviews: 4021, students: 90541, duration: '5h 30m', publishedAt: '2024-09-12', tags: ['Next.js', 'SSR', 'API'], description: lorem(260), url: '#', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop' },
      { id: 11, title: 'Email Marketing Mastery', instructor: 'Charlotte Lee', level: 'Beginner', category: 'Marketing', rating: 4.3, reviews: 480, students: 10430, duration: '1h 55m', publishedAt: '2022-12-04', tags: ['Email', 'Copywriting', 'Automation'], description: lorem(180), url: '#', image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop' },
      { id: 12, title: 'Data Structures & Algorithms', instructor: 'Henry Park', level: 'Advanced', category: 'Development', rating: 4.8, reviews: 7210, students: 140320, duration: '8h 40m', publishedAt: '2023-02-15', tags: ['Algorithms', 'Coding Interviews', 'DSA'], description: lorem(300), url: '#', image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop' }
    ];
  }

  function initRouter() {
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();
  }

  function handleRouteChange() {
    const hash = location.hash || '#';
    // Routes: # -> home, #/signin, #/signup, #/signout, #/courses/:id
    if (hash.startsWith('#/courses/')) {
      const id = hash.split('/')[2];
      renderCourseDetails(id);
    } else if (hash === '#/signin') {
      renderSignIn();
    } else if (hash === '#/signup') {
      renderSignUp();
    } else if (hash === '#/signout') {
      signOut();
      navigateTo('#');
    } else {
      renderHome();
    }
  }

  function navigateTo(hash) {
    if (location.hash === hash) {
      handleRouteChange();
    } else {
      location.hash = hash;
    }
  }

  function renderHome() {
    if (els.homeView) els.homeView.hidden = false;
    if (els.routeView) {
      els.routeView.hidden = true;
      els.routeView.innerHTML = '';
    }
  }

  function renderCourseDetails(id) {
    const course = state.courses.find((c) => String(c.id) === String(id));
    if (!course) {
      renderNotFound('Course not found');
      return;
    }
    if (els.homeView) els.homeView.hidden = true;
    els.routeView.hidden = false;
    els.routeView.innerHTML = courseDetailsHTML(course);
  }

  function courseDetailsHTML(course) {
    const imgUrl = course.image || `https://picsum.photos/seed/${encodeURIComponent(course.id)}/1200/800`;
    return `
      <article class="details">
        <a class="back" href="#">← Back to courses</a>
        <div class="details-hero">
          <img src="${imgUrl}" alt="${escapeHtml(course.title)} cover">
          <div>
            <h1>${escapeHtml(course.title)}</h1>
            <p class="muted">By ${escapeHtml(course.instructor)} • ${escapeHtml(course.level)} • ${course.duration}</p>
            <p>${escapeHtml(course.description)}</p>
            <div class="tags">${course.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
            <div style="margin-top: .75rem; display:flex; gap:.5rem;">
              <a class="btn-primary" href="${course.url || '#'}" target="_blank" rel="noopener">Start course</a>
              ${state.user ? `<button id="enrollBtn" class="btn-secondary">Enroll</button>` : `<a class="btn-secondary" href="#/signin">Sign in to enroll</a>`}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderNotFound(message) {
    if (els.homeView) els.homeView.hidden = true;
    els.routeView.hidden = false;
    els.routeView.innerHTML = `
      <div class="empty">
        <p class="muted">${escapeHtml(message || 'Not found')}</p>
        <p><a href="#">Go home</a></p>
      </div>`;
  }

  // Auth
  function initAuth() {
    try {
      const stored = localStorage.getItem('learnhub_user');
      state.user = stored ? JSON.parse(stored) : null;
    } catch (_) { state.user = null; }
    renderAuthNav();
  }

  function renderAuthNav() {
    if (!els.navAuth) return;
    els.navAuth.innerHTML = state.user
      ? `<a href="#/signout" title="Sign out">Sign out (${escapeHtml(state.user.email)})</a>`
      : `<a href="#/signin">Sign in</a>`;
  }

  function signIn(email) {
    state.user = { email };
    localStorage.setItem('learnhub_user', JSON.stringify(state.user));
    renderAuthNav();
  }

  function signOut() {
    state.user = null;
    localStorage.removeItem('learnhub_user');
    renderAuthNav();
  }

  function renderSignIn() {
    if (els.homeView) els.homeView.hidden = true;
    els.routeView.hidden = false;
    els.routeView.innerHTML = authFormHTML({ mode: 'signin' });
    wireAuthForm('signin');
  }

  function renderSignUp() {
    if (els.homeView) els.homeView.hidden = true;
    els.routeView.hidden = false;
    els.routeView.innerHTML = authFormHTML({ mode: 'signup' });
    wireAuthForm('signup');
  }

  function authFormHTML({ mode }) {
    const isSignIn = mode === 'signin';
    return `
      <section class="auth">
        <div class="auth-card">
          <h1>${isSignIn ? 'Sign in' : 'Create your account'}</h1>
          <form id="authForm">
            <label>Email
              <input id="authEmail" type="email" required placeholder="you@example.com" autocomplete="email" />
            </label>
            <label>Password
              <input id="authPassword" type="password" required minlength="6" placeholder="••••••••" autocomplete="current-password" />
            </label>
            <button class="btn-primary" type="submit">${isSignIn ? 'Sign in' : 'Sign up'}</button>
          </form>
          <p class="muted" style="margin-top:.75rem;">
            ${isSignIn ? `No account? <a href="#/signup">Sign up</a>` : `Already have an account? <a href="#/signin">Sign in</a>`}
          </p>
        </div>
      </section>
    `;
  }

  function wireAuthForm(mode) {
    const form = document.getElementById('authForm');
    const emailEl = document.getElementById('authEmail');
    const passEl = document.getElementById('authPassword');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = String(emailEl.value || '').trim();
      const pass = String(passEl.value || '');
      if (!email || pass.length < 6) return;
      // Demo-only: store just email; no backend
      signIn(email);
      navigateTo('#');
    });
  }
})();