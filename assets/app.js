(function() {
  'use strict';

  const state = {
    courses: [],
    filtered: [],
    query: '',
    category: 'all',
    level: 'all',
    sort: 'popular',
    currentPage: 'home',
    currentUser: null,
    enrolledCourses: []
  };

  const els = {};

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    initializeApp();
  });

  function cacheElements() {
    // Page elements
    els.homePage = document.getElementById('home-page');
    els.courseDetailsPage = document.getElementById('course-details-page');
    els.categoriesPage = document.getElementById('categories-page');
    els.aboutPage = document.getElementById('about-page');
    
    // Course elements
    els.grid = document.getElementById('coursesGrid');
    els.results = document.getElementById('resultsCount');
    els.search = document.getElementById('searchInput');
    els.category = document.getElementById('categorySelect');
    els.level = document.getElementById('levelSelect');
    els.sort = document.getElementById('sortSelect');
    els.clear = document.getElementById('clearFilters');
    
    // Modal elements
    els.courseModal = document.getElementById('courseModal');
    els.modalBackdrop = els.courseModal.querySelector('.modal-backdrop');
    els.modalClose = els.courseModal.querySelector('.modal-close');
    els.modalImage = document.getElementById('modalImage');
    els.modalTitle = document.getElementById('modalTitle');
    els.modalDesc = document.getElementById('modalDesc');
    els.modalInstructor = document.getElementById('modalInstructor');
    els.modalLevel = document.getElementById('modalLevel');
    els.modalDuration = document.getElementById('modalDuration');
    els.modalTags = document.getElementById('modalTags');
    els.modalViewDetails = document.getElementById('modalViewDetails');
    els.modalEnroll = document.getElementById('modalEnroll');
    
    // Auth elements
    els.authModal = document.getElementById('authModal');
    els.authBackdrop = els.authModal.querySelector('.modal-backdrop');
    els.authClose = els.authModal.querySelector('.modal-close');
    els.signInForm = document.getElementById('signInForm');
    els.signUpForm = document.getElementById('signUpForm');
    els.signInFormElement = document.getElementById('signInFormElement');
    els.signUpFormElement = document.getElementById('signUpFormElement');
    els.switchToSignUp = document.getElementById('switchToSignUp');
    els.switchToSignIn = document.getElementById('switchToSignIn');
    els.signInBtn = document.getElementById('signInBtn');
    els.signUpBtn = document.getElementById('signUpBtn');
    els.authButtons = document.getElementById('auth-buttons');
    els.userMenu = document.getElementById('user-menu');
    els.userMenuBtn = document.getElementById('userMenuBtn');
    els.userDropdown = document.getElementById('userDropdown');
    els.userInitials = document.getElementById('userInitials');
    els.userName = document.getElementById('userName');
    els.signOutBtn = document.getElementById('signOutBtn');
    
    // Navigation elements
    els.navLinks = document.querySelectorAll('[data-page]');
    els.navToggle = document.querySelector('.nav-toggle');
    els.siteNav = document.querySelector('.site-nav');
    
    // Course details elements
    els.courseDetailsContent = document.getElementById('courseDetailsContent');
    els.courseTitleBreadcrumb = document.getElementById('courseTitleBreadcrumb');
    
    // Categories elements
    els.categoriesGrid = document.getElementById('categoriesGrid');
  }

  function initializeApp() {
    hydrateInitialData();
    wireEventListeners();
    checkAuthState();
    renderYear();
    showPage('home');
  }

  function hydrateInitialData() {
    state.courses = getSeedCourses();
    populateCategoryOptions(state.courses);
    applyFilters();
  }

  function wireEventListeners() {
    // Navigation
    els.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        showPage(page);
      });
    });

    // Mobile navigation
    els.navToggle.addEventListener('click', () => {
      const isOpen = els.siteNav.classList.toggle('open');
      els.navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Search and filters
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

    // Course interactions
    els.grid.addEventListener('click', (e) => {
      const button = e.target.closest('[data-course-id]');
      if (button) {
        const courseId = button.getAttribute('data-course-id');
        const course = state.filtered.find((c) => String(c.id) === String(courseId)) || 
                      state.courses.find((c) => String(c.id) === String(courseId));
        if (course) openCourseModal(course);
      }
    });

    // Course modal interactions
    els.modalViewDetails.addEventListener('click', () => {
      const courseId = els.modalTitle.getAttribute('data-course-id');
      const course = state.courses.find(c => String(c.id) === String(courseId));
      if (course) {
        closeCourseModal();
        showCourseDetails(course);
      }
    });

    els.modalEnroll.addEventListener('click', () => {
      const courseId = els.modalTitle.getAttribute('data-course-id');
      enrollInCourse(courseId);
    });

    // Close modals
    els.courseModal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]') || e.target === els.modalBackdrop) closeCourseModal();
    });
    
    els.authModal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]') || e.target === els.authBackdrop) closeAuthModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!els.courseModal.hasAttribute('hidden')) closeCourseModal();
        if (!els.authModal.hasAttribute('hidden')) closeAuthModal();
      }
    });

    // Authentication
    els.signInBtn.addEventListener('click', () => openAuthModal('signin'));
    els.signUpBtn.addEventListener('click', () => openAuthModal('signup'));
    els.switchToSignUp.addEventListener('click', () => switchAuthForm('signup'));
    els.switchToSignIn.addEventListener('click', () => switchAuthForm('signin'));
    els.signInFormElement.addEventListener('submit', handleSignIn);
    els.signUpFormElement.addEventListener('submit', handleSignUp);
    els.signOutBtn.addEventListener('click', handleSignOut);
    
    // User menu
    els.userMenuBtn.addEventListener('click', () => {
      const isOpen = els.userDropdown.hidden;
      els.userDropdown.hidden = !isOpen;
      els.userMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!els.userMenu.contains(e.target)) {
        els.userDropdown.hidden = true;
        els.userMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function showPage(pageName) {
    // Hide all pages
    els.homePage.hidden = true;
    els.courseDetailsPage.hidden = true;
    els.categoriesPage.hidden = true;
    els.aboutPage.hidden = true;

    // Show selected page
    switch (pageName) {
      case 'home':
        els.homePage.hidden = false;
        break;
      case 'courses':
        els.homePage.hidden = false;
        // Scroll to courses section
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
        break;
      case 'categories':
        els.categoriesPage.hidden = false;
        renderCategories();
        break;
      case 'about':
        els.aboutPage.hidden = false;
        break;
      default:
        els.homePage.hidden = false;
    }

    state.currentPage = pageName;
    
    // Update active navigation
    els.navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-page') === pageName);
    });
  }

  function showCourseDetails(course) {
    els.homePage.hidden = true;
    els.courseDetailsPage.hidden = false;
    
    els.courseTitleBreadcrumb.textContent = course.title;
    
    const isEnrolled = state.enrolledCourses.includes(course.id);
    
    els.courseDetailsContent.innerHTML = `
      <div class="course-details-header">
        <h1>${escapeHtml(course.title)}</h1>
        <div class="course-meta">
          <span>⭐ ${course.rating.toFixed(1)} (${formatNumber(course.reviews)} reviews)</span>
          <span>👤 ${escapeHtml(course.instructor)}</span>
          <span>⏱️ ${course.duration}</span>
          <span>🏷️ ${escapeHtml(course.level)}</span>
          <span>📚 ${escapeHtml(course.category)}</span>
        </div>
      </div>
      <div class="course-details-content">
        <h2>About this course</h2>
        <p>${escapeHtml(course.description)}</p>
        
        <h2>What you'll learn</h2>
        <p>This comprehensive course will take you from fundamentals to advanced concepts, with hands-on projects and real-world examples. You'll build practical skills that you can immediately apply in your work.</p>
        
        <h2>Course content</h2>
        <p>• Introduction and setup<br>
        • Core concepts and fundamentals<br>
        • Advanced techniques and best practices<br>
        • Real-world projects and case studies<br>
        • Final project and next steps</p>
        
        <h2>Requirements</h2>
        <p>• Basic computer skills<br>
        • No prior experience required (for beginner courses)<br>
        • A computer with internet access</p>
        
        <div class="course-actions">
          ${isEnrolled ? 
            '<button class="btn-primary" disabled>Already Enrolled</button>' :
            '<button class="btn-primary" onclick="enrollInCourse(' + course.id + ')">Enroll Now</button>'
          }
          <button class="btn-secondary" onclick="showPage(\'home\')">Back to Courses</button>
        </div>
      </div>
    `;
    
    state.currentPage = 'course-details';
  }

  function renderCategories() {
    const categories = Array.from(new Set(state.courses.map(c => c.category))).sort();
    
    els.categoriesGrid.innerHTML = categories.map(cat => {
      const categoryCourses = state.courses.filter(c => c.category === cat);
      const avgRating = categoryCourses.reduce((sum, c) => sum + c.rating, 0) / categoryCourses.length;
      
      return `
        <div class="category-card">
          <h3>${escapeHtml(cat)}</h3>
          <p>${categoryCourses.length} courses available</p>
          <p>Average rating: ⭐ ${avgRating.toFixed(1)}</p>
          <button class="btn-primary" onclick="filterByCategory('${cat.toLowerCase()}')">Browse Courses</button>
        </div>
      `;
    }).join('');
  }

  function filterByCategory(category) {
    showPage('home');
    els.category.value = category;
    state.category = category;
    applyFilters();
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
    const isEnrolled = state.enrolledCourses.includes(course.id);
    
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
            ${isEnrolled ? 
              '<span class="tag" style="background: var(--success); color: white;">Enrolled</span>' :
              '<button class="view-btn" data-course-id="' + course.id + '" aria-haspopup="dialog" aria-controls="courseModal">View details</button>'
            }
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

  function openCourseModal(course) {
    els.modalImage.src = course.image || `https://picsum.photos/seed/${encodeURIComponent(course.id)}/1200/800`;
    els.modalImage.alt = `${course.title} image`;
    els.modalTitle.textContent = course.title;
    els.modalTitle.setAttribute('data-course-id', course.id);
    els.modalDesc.textContent = course.description;
    els.modalInstructor.textContent = `Instructor: ${course.instructor}`;
    els.modalLevel.textContent = `Level: ${course.level}`;
    els.modalDuration.textContent = `Duration: ${course.duration}`;
    els.modalTags.innerHTML = course.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('');

    const isEnrolled = state.enrolledCourses.includes(course.id);
    els.modalEnroll.textContent = isEnrolled ? 'Already Enrolled' : 'Enroll Now';
    els.modalEnroll.disabled = isEnrolled;

    showCourseModal();
  }

  function showCourseModal() {
    els.courseModal.removeAttribute('hidden');
    els.courseModal.setAttribute('aria-hidden', 'false');
    trapFocus(els.courseModal);
  }

  function closeCourseModal() {
    els.courseModal.setAttribute('aria-hidden', 'true');
    els.courseModal.setAttribute('hidden', '');
    releaseFocusTrap();
  }

  // Authentication functions
  function openAuthModal(type) {
    els.authModal.removeAttribute('hidden');
    els.authModal.setAttribute('aria-hidden', 'false');
    switchAuthForm(type);
    trapFocus(els.authModal);
  }

  function closeAuthModal() {
    els.authModal.setAttribute('aria-hidden', 'true');
    els.authModal.setAttribute('hidden', '');
    releaseFocusTrap();
  }

  function switchAuthForm(type) {
    if (type === 'signup') {
      els.signInForm.hidden = true;
      els.signUpForm.hidden = false;
    } else {
      els.signInForm.hidden = false;
      els.signUpForm.hidden = true;
    }
  }

  function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;

    // Simple validation - in a real app, this would be an API call
    if (email && password) {
      const user = { email, name: email.split('@')[0] };
      signInUser(user);
      closeAuthModal();
      els.signInFormElement.reset();
    }
  }

  function handleSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (name && email && password) {
      const user = { email, name };
      signInUser(user);
      closeAuthModal();
      els.signUpFormElement.reset();
    }
  }

  function signInUser(user) {
    state.currentUser = user;
    localStorage.setItem('learnhub_user', JSON.stringify(user));
    updateAuthUI();
  }

  function handleSignOut() {
    state.currentUser = null;
    state.enrolledCourses = [];
    localStorage.removeItem('learnhub_user');
    updateAuthUI();
    showPage('home');
  }

  function checkAuthState() {
    const savedUser = localStorage.getItem('learnhub_user');
    if (savedUser) {
      state.currentUser = JSON.parse(savedUser);
      updateAuthUI();
    }
  }

  function updateAuthUI() {
    if (state.currentUser) {
      els.authButtons.hidden = true;
      els.userMenu.hidden = false;
      els.userInitials.textContent = state.currentUser.name.charAt(0).toUpperCase();
      els.userName.textContent = state.currentUser.name;
    } else {
      els.authButtons.hidden = false;
      els.userMenu.hidden = true;
    }
  }

  function enrollInCourse(courseId) {
    if (!state.currentUser) {
      openAuthModal('signin');
      return;
    }

    if (!state.enrolledCourses.includes(courseId)) {
      state.enrolledCourses.push(courseId);
      localStorage.setItem('learnhub_enrolled', JSON.stringify(state.enrolledCourses));
      
      // Update UI
      if (state.currentPage === 'home') {
        applyFilters(); // Re-render to show enrolled status
      }
      
      // Show success message
      showNotification('Successfully enrolled in course!', 'success');
    }
  }

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--brand)'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: var(--shadow-2);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
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

  // Load enrolled courses from localStorage
  const savedEnrolled = localStorage.getItem('learnhub_enrolled');
  if (savedEnrolled) {
    state.enrolledCourses = JSON.parse(savedEnrolled);
  }

  // Add CSS animations for notifications
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();