(function() {
  'use strict';

  // Application state
  const state = {
    courses: [],
    filtered: [],
    query: '',
    category: 'all',
    level: 'all',
    sort: 'popular',
    currentPage: 'home', // 'home' or 'courseDetails'
    currentCourse: null,
    user: null, // User authentication state
    enrolledCourses: new Set(),
    wishlist: new Set()
  };

  // DOM elements cache
  const els = {};

  // Initialize app
  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    initializeAuth();
    hydrateInitialData();
    wireEventListeners();
    renderYear();
    checkAuthState();
  });

  function cacheElements() {
    // Main app elements
    els.app = document.getElementById('app');
    els.homePage = document.getElementById('homePage');
    els.courseDetailsPage = document.getElementById('courseDetailsPage');
    
    // Course grid and filters
    els.grid = document.getElementById('coursesGrid');
    els.results = document.getElementById('resultsCount');
    els.search = document.getElementById('searchInput');
    els.category = document.getElementById('categorySelect');
    els.level = document.getElementById('levelSelect');
    els.sort = document.getElementById('sortSelect');
    els.clear = document.getElementById('clearFilters');
    
    // Navigation
    els.homeLink = document.getElementById('homeLink');
    els.coursesLink = document.getElementById('coursesLink');
    els.backToCourses = document.getElementById('backToCourses');
    
    // Authentication elements
    els.authButtons = document.getElementById('authButtons');
    els.signInBtn = document.getElementById('signInBtn');
    els.signUpBtn = document.getElementById('signUpBtn');
    els.userMenu = document.getElementById('userMenu');
    els.userAvatar = document.getElementById('userAvatar');
    els.userInitials = document.getElementById('userInitials');
    els.userName = document.getElementById('userName');
    els.userEmail = document.getElementById('userEmail');
    els.userDropdown = document.getElementById('userDropdown');
    els.myCoursesBtn = document.getElementById('myCoursesBtn');
    els.profileBtn = document.getElementById('profileBtn');
    els.signOutBtn = document.getElementById('signOutBtn');
    
    // Auth modals
    els.signInModal = document.getElementById('signInModal');
    els.signUpModal = document.getElementById('signUpModal');
    els.signInForm = document.getElementById('signInForm');
    els.signUpForm = document.getElementById('signUpForm');
    els.switchToSignUp = document.getElementById('switchToSignUp');
    els.switchToSignIn = document.getElementById('switchToSignIn');
    
    // Course modal (existing)
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
    els.viewDetailsBtn = document.getElementById('viewDetailsBtn');
    
    // Course details page elements
    els.courseTitle = document.getElementById('courseTitle');
    els.courseDescription = document.getElementById('courseDescription');
    els.courseInstructor = document.getElementById('courseInstructor');
    els.courseLevel = document.getElementById('courseLevel');
    els.courseDuration = document.getElementById('courseDuration');
    els.courseStudents = document.getElementById('courseStudents');
    els.courseRating = document.getElementById('courseRating');
    els.courseReviews = document.getElementById('courseReviews');
    els.courseTags = document.getElementById('courseTags');
    els.courseImage = document.getElementById('courseImage');
    els.enrollBtn = document.getElementById('enrollBtn');
    els.addToWishlistBtn = document.getElementById('addToWishlistBtn');
    
    // Course content tabs
    els.tabBtns = document.querySelectorAll('.tab-btn');
    els.tabPanes = document.querySelectorAll('.tab-pane');
  }

  function initializeAuth() {
    // Load user data from localStorage
    const savedUser = localStorage.getItem('learnhub_user');
    const savedEnrolled = localStorage.getItem('learnhub_enrolled');
    const savedWishlist = localStorage.getItem('learnhub_wishlist');
    
    if (savedUser) {
      state.user = JSON.parse(savedUser);
    }
    
    if (savedEnrolled) {
      state.enrolledCourses = new Set(JSON.parse(savedEnrolled));
    }
    
    if (savedWishlist) {
      state.wishlist = new Set(JSON.parse(savedWishlist));
    }
  }

  function hydrateInitialData() {
    state.courses = getSeedCourses();
    populateCategoryOptions(state.courses);
    applyFilters();
  }

  function wireEventListeners() {
    wireHeaderNav();
    wireFilters();
    wireAuthEvents();
    wireCourseEvents();
    wireNavigationEvents();
    wireCourseDetailsEvents();
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
        const course = findCourseById(courseId);
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

  function wireAuthEvents() {
    // Show auth modals
    els.signInBtn.addEventListener('click', () => showAuthModal('signIn'));
    els.signUpBtn.addEventListener('click', () => showAuthModal('signUp'));
    
    // Switch between auth modals
    els.switchToSignUp.addEventListener('click', () => {
      closeAuthModal('signIn');
      showAuthModal('signUp');
    });
    els.switchToSignIn.addEventListener('click', () => {
      closeAuthModal('signUp');
      showAuthModal('signIn');
    });
    
    // Handle form submissions
    els.signInForm.addEventListener('submit', handleSignIn);
    els.signUpForm.addEventListener('submit', handleSignUp);
    
    // User menu interactions
    els.userAvatar.addEventListener('click', toggleUserMenu);
    els.signOutBtn.addEventListener('click', handleSignOut);
    
    // Close auth modals
    els.signInModal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')) {
        closeAuthModal('signIn');
      }
    });
    els.signUpModal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')) {
        closeAuthModal('signUp');
      }
    });
    
    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!els.userMenu.contains(e.target)) {
        els.userMenu.classList.remove('open');
      }
    });
    
    // Handle escape key for auth modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!els.signInModal.hasAttribute('hidden')) closeAuthModal('signIn');
        if (!els.signUpModal.hasAttribute('hidden')) closeAuthModal('signUp');
      }
    });
  }

  function wireCourseEvents() {
    els.viewDetailsBtn.addEventListener('click', () => {
      if (state.currentCourse) {
        closeModal();
        showCourseDetails(state.currentCourse);
      }
    });
  }

  function wireNavigationEvents() {
    els.homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      showHomePage();
    });
    
    els.coursesLink.addEventListener('click', (e) => {
      e.preventDefault();
      showHomePage();
      document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    });
    
    els.backToCourses.addEventListener('click', () => {
      showHomePage();
    });
  }

  function wireCourseDetailsEvents() {
    // Tab navigation
    els.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
      });
    });
    
    // Course actions
    els.enrollBtn.addEventListener('click', handleEnroll);
    els.addToWishlistBtn.addEventListener('click', handleWishlist);
  }

  // Authentication functions
  function showAuthModal(type) {
    const modal = type === 'signIn' ? els.signInModal : els.signUpModal;
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus first input
    const firstInput = modal.querySelector('input');
    if (firstInput) firstInput.focus();
  }

  function closeAuthModal(type) {
    const modal = type === 'signIn' ? els.signInModal : els.signUpModal;
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    
    // Clear form
    const form = type === 'signIn' ? els.signInForm : els.signUpForm;
    form.reset();
  }

  function handleSignIn(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
      const user = {
        id: Date.now(),
        name: email.split('@')[0], // Simple name extraction
        email: email,
        joinDate: new Date().toISOString()
      };
      
      state.user = user;
      localStorage.setItem('learnhub_user', JSON.stringify(user));
      
      closeAuthModal('signIn');
      updateAuthUI();
      showNotification('Welcome back!', 'success');
    }
  }

  function handleSignUp(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validation
    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    
    if (name && email && password) {
      const user = {
        id: Date.now(),
        name: name,
        email: email,
        joinDate: new Date().toISOString()
      };
      
      state.user = user;
      localStorage.setItem('learnhub_user', JSON.stringify(user));
      
      closeAuthModal('signUp');
      updateAuthUI();
      showNotification('Account created successfully!', 'success');
    }
  }

  function handleSignOut() {
    state.user = null;
    localStorage.removeItem('learnhub_user');
    updateAuthUI();
    els.userMenu.classList.remove('open');
    showNotification('Signed out successfully', 'success');
  }

  function toggleUserMenu() {
    els.userMenu.classList.toggle('open');
  }

  function checkAuthState() {
    updateAuthUI();
  }

  function updateAuthUI() {
    if (state.user) {
      // Show user menu, hide auth buttons
      els.authButtons.style.display = 'none';
      els.userMenu.removeAttribute('hidden');
      
      // Update user info
      els.userName.textContent = state.user.name;
      els.userEmail.textContent = state.user.email;
      els.userInitials.textContent = state.user.name.charAt(0).toUpperCase();
    } else {
      // Show auth buttons, hide user menu
      els.authButtons.style.display = 'flex';
      els.userMenu.setAttribute('hidden', '');
    }
  }

  // Course details functions
  function showCourseDetails(course) {
    state.currentPage = 'courseDetails';
    state.currentCourse = course;
    
    els.homePage.setAttribute('hidden', '');
    els.courseDetailsPage.removeAttribute('hidden');
    
    populateCourseDetails(course);
    window.scrollTo(0, 0);
  }

  function showHomePage() {
    state.currentPage = 'home';
    state.currentCourse = null;
    
    els.courseDetailsPage.setAttribute('hidden', '');
    els.homePage.removeAttribute('hidden');
  }

  function populateCourseDetails(course) {
    // Basic course info
    els.courseTitle.textContent = course.title;
    els.courseDescription.textContent = course.description;
    els.courseInstructor.textContent = course.instructor;
    els.courseLevel.textContent = course.level;
    els.courseDuration.textContent = course.duration;
    els.courseStudents.textContent = formatNumber(course.students);
    
    // Rating
    els.courseRating.innerHTML = generateStarRating(course.rating);
    els.courseReviews.textContent = `(${formatNumber(course.reviews)} reviews)`;
    
    // Tags
    els.courseTags.innerHTML = course.tags.map(tag => 
      `<span class="tag">${escapeHtml(tag)}</span>`
    ).join('');
    
    // Image
    const imgUrl = course.image || `https://picsum.photos/seed/${encodeURIComponent(course.id)}/1200/800`;
    els.courseImage.src = imgUrl;
    els.courseImage.alt = `${course.title} thumbnail`;
    
    // Update enrollment button
    updateEnrollmentUI(course.id);
  }

  function switchTab(tabName) {
    // Update tab buttons
    els.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    
    // Update tab panes
    els.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `${tabName}Tab`);
    });
  }

  function handleEnroll() {
    if (!state.user) {
      showAuthModal('signIn');
      return;
    }
    
    if (state.currentCourse) {
      const courseId = state.currentCourse.id;
      if (state.enrolledCourses.has(courseId)) {
        // Already enrolled - could show course content or progress
        showNotification('You are already enrolled in this course!', 'info');
      } else {
        state.enrolledCourses.add(courseId);
        localStorage.setItem('learnhub_enrolled', JSON.stringify([...state.enrolledCourses]));
        updateEnrollmentUI(courseId);
        showNotification('Successfully enrolled in course!', 'success');
      }
    }
  }

  function handleWishlist() {
    if (!state.user) {
      showAuthModal('signIn');
      return;
    }
    
    if (state.currentCourse) {
      const courseId = state.currentCourse.id;
      if (state.wishlist.has(courseId)) {
        state.wishlist.delete(courseId);
        showNotification('Removed from wishlist', 'info');
      } else {
        state.wishlist.add(courseId);
        showNotification('Added to wishlist', 'success');
      }
      
      localStorage.setItem('learnhub_wishlist', JSON.stringify([...state.wishlist]));
      updateWishlistUI(courseId);
    }
  }

  function updateEnrollmentUI(courseId) {
    const isEnrolled = state.enrolledCourses.has(courseId);
    els.enrollBtn.textContent = isEnrolled ? 'Continue Learning' : 'Enroll Now';
    els.enrollBtn.classList.toggle('enrolled', isEnrolled);
  }

  function updateWishlistUI(courseId) {
    const isInWishlist = state.wishlist.has(courseId);
    els.addToWishlistBtn.textContent = isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
  }

  // Existing course functions (updated)
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
    const isEnrolled = state.enrolledCourses.has(course.id);
    const isInWishlist = state.wishlist.has(course.id);
    
    return `
      <article class="card" tabindex="0">
        <div class="card-media">
          <img src="${imgUrl}" alt="${escapeHtml(course.title)} thumbnail" loading="lazy" width="800" height="450" />
          ${isInWishlist ? '<div class="wishlist-badge">♡</div>' : ''}
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
            <button class="view-btn ${isEnrolled ? 'enrolled' : ''}" data-course-id="${course.id}" aria-haspopup="dialog" aria-controls="courseModal">
              ${isEnrolled ? 'Continue' : 'View details'}
            </button>
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
    state.currentCourse = course;
    
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

  // Focus trap (existing code)
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

  // Utility functions
  function findCourseById(courseId) {
    return state.filtered.find((c) => String(c.id) === String(courseId)) || 
           state.courses.find((c) => String(c.id) === String(courseId));
  }

  function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '⭐';
    }
    if (hasHalfStar) {
      stars += '⭐'; // Could use half-star character if available
    }
    
    return stars;
  }

  function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    switch (type) {
      case 'success':
        notification.style.background = 'var(--success)';
        break;
      case 'error':
        notification.style.background = 'var(--error)';
        break;
      case 'warning':
        notification.style.background = 'var(--warning)';
        break;
      default:
        notification.style.background = 'var(--brand)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

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
      + 'This course guides you from fundamentals to real-world proficiency in just a few hours. '
      + 'Perfect for beginners and experienced developers looking to expand their skillset.'
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
})();