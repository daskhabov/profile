/* ============================================
   DENI ASKHABOV — PORTFOLIO v2
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // ---- Theme Toggle ----
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) html.setAttribute('data-theme', stored);

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ---- Active nav tracking ----
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.sidebar__nav-link');

  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 200) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ---- Smooth scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- Mobile menu ----
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      // If stats drawer is open, close it instead of toggling nav
      if (mobileStats && mobileStats.classList.contains('open')) {
        closeStats();
        return;
      }
      burger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Mobile Stats Drawer (button toggle + pull-down gesture) ----
  const mobileStats = document.getElementById('mobileStats');
  const mobileHeader = document.getElementById('mobileHeader');
  const statsHandle = document.getElementById('statsHandle');
  const pullHint = document.getElementById('pullHint');

  // Position drawer below header
  function updateDrawerTop() {
    if (mobileHeader && mobileStats) {
      mobileStats.style.top = mobileHeader.offsetHeight + 'px';
    }
  }

  function openStats() {
    mobileStats.classList.remove('dragging');
    mobileStats.style.transform = '';
    mobileHeader.classList.add('stats-open');
    document.body.classList.add('stats-open');
    requestAnimationFrame(() => {
      updateDrawerTop();
      mobileStats.classList.add('open');
    });
  }

  function closeStats() {
    mobileStats.classList.remove('dragging');
    mobileStats.style.transform = '';
    mobileStats.classList.remove('open');
    setTimeout(() => {
      mobileHeader.classList.remove('stats-open');
      document.body.classList.remove('stats-open');
      requestAnimationFrame(updateDrawerTop);
    }, 50);
  }

  function toggleStats() {
    if (mobileStats.classList.contains('open')) {
      closeStats();
    } else {
      openStats();
    }
  }

  // Chevron pull-hint opens the drawer on tap
  if (pullHint) {
    pullHint.addEventListener('click', (e) => {
      e.stopPropagation();
      openStats();
    });
  }

  if (mobileStats) {
    updateDrawerTop();
    window.addEventListener('resize', updateDrawerTop);
  }

  // Auto-close when user scrolls past the bottom of the drawer content
  if (mobileStats) {
    mobileStats.addEventListener('scroll', () => {
      if (!mobileStats.classList.contains('open')) return;
      const { scrollTop, scrollHeight, clientHeight } = mobileStats;
      if (scrollTop + clientHeight >= scrollHeight - 2) {
        closeStats();
      }
    }, { passive: true });
  }

  // Pull-down gesture on mobile header
  if (mobileHeader && mobileStats) {
    let startY = 0;
    let dragging = false;
    let isOpen = false;
    let gestureStarted = false;
    let drawerH = 0;

    mobileHeader.addEventListener('touchstart', (e) => {
      if (e.target.closest('button')) return;
      startY = e.touches[0].clientY;
      isOpen = mobileStats.classList.contains('open');
      dragging = true;
      gestureStarted = false;
      drawerH = mobileStats.scrollHeight || 300;
    }, { passive: true });

    // Chevron area also initiates pull gesture
    if (pullHint) {
      pullHint.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isOpen = false;
        dragging = true;
        gestureStarted = false;
        drawerH = mobileStats.scrollHeight || 300;
      }, { passive: true });
    }

    document.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const currentY = e.touches[0].clientY;
      const delta = currentY - startY;

      if (!isOpen && delta > 5 && window.scrollY <= 0) {
        e.preventDefault();
        if (!gestureStarted) {
          gestureStarted = true;
          // Expand header immediately when gesture starts
          mobileHeader.classList.add('stats-open');
          requestAnimationFrame(updateDrawerTop);
        }
        mobileStats.classList.add('dragging');
        const pct = Math.min(delta / drawerH, 1);
        const translateVal = -100 + (pct * 100);
        mobileStats.style.transform = 'translateY(' + translateVal + '%)';
      } else if (isOpen && delta < -5) {
        e.preventDefault();
        gestureStarted = true;
        mobileStats.classList.add('dragging');
        const pct = Math.min(Math.abs(delta) / drawerH, 1);
        const translateVal = -(pct * 100);
        mobileStats.style.transform = 'translateY(' + translateVal + '%)';
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      mobileStats.classList.remove('dragging');

      if (!gestureStarted) return;

      if (!isOpen) {
        openStats();
      } else {
        const current = mobileStats.style.transform;
        const match = current.match(/translateY\((-?[\d.]+)%\)/);
        const val = match ? parseFloat(match[1]) : 0;
        if (val < -25) {
          closeStats();
        } else {
          openStats();
        }
      }
    });

    if (statsHandle) {
      statsHandle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isOpen = true;
        dragging = true;
        gestureStarted = false;
        drawerH = mobileStats.scrollHeight || 300;
      }, { passive: true });
    }
  }

  // ---- GSAP Animations ----

  // Sidebar entrance
  gsap.from('.sidebar__name', { opacity: 0, y: 20, duration: 0.7, delay: 0.15, ease: 'power2.out' });
  gsap.from('.sidebar__role', { opacity: 0, y: 12, duration: 0.5, delay: 0.3, ease: 'power2.out' });
  gsap.from('.sidebar__location', { opacity: 0, y: 10, duration: 0.5, delay: 0.38, ease: 'power2.out' });
  gsap.from('.sidebar__nav-link', { opacity: 0, x: -12, duration: 0.4, stagger: 0.05, delay: 0.45, ease: 'power2.out' });

  // Skill bars animate in
  document.querySelectorAll('.skill-bar__fill').forEach(bar => {
    const target = bar.style.getPropertyValue('--pct');
    bar.style.width = '0%';
    gsap.to(bar, {
      width: target,
      duration: 1,
      delay: 0.7,
      ease: 'power2.out'
    });
  });

  gsap.from('.sidebar__social', { opacity: 0, y: 8, duration: 0.4, stagger: 0.06, delay: 0.9, ease: 'power2.out' });

  // Content sections
  gsap.from('.about__lead', {
    scrollTrigger: { trigger: '#about', start: 'top 80%' },
    opacity: 0, y: 18, duration: 0.6, ease: 'power2.out'
  });
  gsap.from('.about__text', {
    scrollTrigger: { trigger: '.about__text', start: 'top 85%' },
    opacity: 0, y: 18, duration: 0.5, stagger: 0.1, ease: 'power2.out'
  });
  gsap.from('.about__detail', {
    scrollTrigger: { trigger: '.about__details', start: 'top 85%' },
    opacity: 0, y: 12, duration: 0.4, stagger: 0.06, ease: 'power2.out'
  });

  document.querySelectorAll('.exp-card').forEach(card => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 85%' },
      opacity: 0, y: 22, duration: 0.6, ease: 'power2.out'
    });
  });

  document.querySelectorAll('.exp-card__highlight').forEach((h, i) => {
    gsap.from(h, {
      scrollTrigger: { trigger: h, start: 'top 90%' },
      opacity: 0, y: 12, duration: 0.4, delay: i * 0.04, ease: 'power2.out'
    });
  });

  document.querySelectorAll('.project').forEach(p => {
    gsap.from(p, {
      scrollTrigger: { trigger: p, start: 'top 85%' },
      opacity: 0, y: 22, duration: 0.6, ease: 'power2.out'
    });
  });

  gsap.from('.skill-col', {
    scrollTrigger: { trigger: '.skills-grid', start: 'top 80%' },
    opacity: 0, y: 18, duration: 0.5, stagger: 0.06, ease: 'power2.out'
  });

  gsap.from('.contact__text', {
    scrollTrigger: { trigger: '#contact', start: 'top 85%' },
    opacity: 0, y: 18, duration: 0.5, ease: 'power2.out'
  });
  gsap.from('.contact__link', {
    scrollTrigger: { trigger: '.contact__links', start: 'top 90%' },
    opacity: 0, x: -12, duration: 0.4, stagger: 0.06, ease: 'power2.out'
  });

  // ---- Language Switcher ----
  const langSwitcher = document.getElementById('langSwitcher');
  const langBtn = document.getElementById('langBtn');
  const langCurrent = document.getElementById('langCurrent');
  const langOptions = document.querySelectorAll('.lang-switcher__option');
  let i18nData = null;
  let currentLang = localStorage.getItem('lang') || 'en';

  // Load translations
  fetch('i18n.json')
    .then(r => r.json())
    .then(data => {
      i18nData = data;
      // Apply stored language on load
      if (currentLang !== 'en') applyLanguage(currentLang);
      langCurrent.textContent = currentLang.toUpperCase();
      langOptions.forEach(o => {
        o.classList.toggle('active', o.dataset.lang === currentLang);
      });
    })
    .catch(() => { /* silently fail — English stays as default */ });

  function applyLanguage(lang) {
    if (!i18nData || !i18nData[lang]) return;
    const strings = i18nData[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[key] !== undefined) {
        el.innerHTML = strings[key];
      }
    });
    document.documentElement.lang = lang === 'nl' ? 'nl' : lang === 'fr' ? 'fr' : lang === 'ru' ? 'ru' : 'en';
  }

  if (langBtn && langSwitcher) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSwitcher.classList.toggle('open');
    });

    langOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const lang = opt.dataset.lang;
        currentLang = lang;
        langCurrent.textContent = lang.toUpperCase();
        langOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        langSwitcher.classList.remove('open');
        applyLanguage(lang);
        localStorage.setItem('lang', lang);
      });
    });

    document.addEventListener('click', () => {
      langSwitcher.classList.remove('open');
    });
  }

  // ---- Hover glow on cards ----
  document.querySelectorAll('.exp-card, .project').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(350px circle at ${x}px ${y}px, rgba(201, 168, 76, 0.04), transparent 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
});
