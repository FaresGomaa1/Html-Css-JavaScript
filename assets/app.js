(function() {
  'use strict';

  const state = {
    courses: [],
    filtered: [],
    query: '',
    category: 'all',
    level: 'all',
    sort: 'popular'
  };

  const els = {};

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    hydrateInitialData();
    wireHeaderNav();
    if (window.Auth && typeof window.Auth.renderNavControls === 'function') window.Auth.renderNavControls();
    wireFilters();
    renderYear();
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
  }

  function hydrateInitialData() {
    state.courses = (window.Data && typeof window.Data.getSeedCourses === 'function') ? window.Data.getSeedCourses() : [];
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
          <h3 class="card-title"><a href="course.html?id=${course.id}">${escapeHtml(course.title)}</a></h3>
          <div class="card-meta">
            <span>⭐ ${course.rating.toFixed(1)} (${formatNumber(course.reviews)})</span>
            <span>👤 ${escapeHtml(course.instructor)}</span>
            <span>⏱️ ${course.duration}</span>
            <span>🏷️ ${escapeHtml(course.level)}</span>
          </div>
          <div class="tags">${course.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
          <div class="card-actions">
            <span class="muted">${formatNumber(course.students)} learners</span>
            <button class="view-btn" data-course-id="${course.id}" aria-haspopup="dialog" aria-controls="courseModal">Quick view</button>
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
    return String(str).replace(/[&<>\"]+/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s]));
  }

  function renderYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  // Removed local getSeedCourses; now sourced from window.Data
})();