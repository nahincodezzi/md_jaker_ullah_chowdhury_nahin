/* =========================================================
   SQA Portfolio — Interactive Features & Micro-Interactions
   Md Jaker Ullah Chowdhury Nahin
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const pad = (n) => String(n).padStart(2, '0');
  const hasIO = 'IntersectionObserver' in window;

  /* =========================================================
     1. THEME TOGGLE (DARK / LIGHT)
     ========================================================= */
  const themeToggle = $('#themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return prefersDark.matches ? 'dark' : 'dark'; // High-tech dark default
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      themeToggle.innerHTML = theme === 'dark' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  };

  let currentTheme = getInitialTheme();
  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
  }

  prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* =========================================================
     2. SCROLL PROGRESS BAR & HEADER SHADOW & BACK TO TOP
     ========================================================= */
  const header = $('#header');
  const scrollProgress = $('#scrollProgress');
  const toTop = $('#toTop');

  const onScroll = () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    
    if (scrollProgress) scrollProgress.style.width = `${progress}%`;
    if (header) header.classList.toggle('is-scrolled', scrollY > 15);
    if (toTop) toTop.classList.toggle('is-visible', scrollY > 500);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* =========================================================
     3. MOBILE NAVIGATION MENU
     ========================================================= */
  const nav = $('#nav');
  const navToggle = $('#navToggle');

  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
    }
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    $$('a', nav).forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
    });
  }

  /* =========================================================
     4. ACTIVE NAVIGATION SCROLLSPY
     ========================================================= */
  const navLinks = $$('.nav__link:not(.btn)');
  if (hasIO && navLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navLinks.forEach((l) => {
            const matches = l.getAttribute('href') === `#${en.target.id}`;
            l.classList.toggle('is-active', matches);
          });
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    navLinks.forEach((l) => {
      const href = l.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = $(href);
        if (target) spy.observe(target);
      }
    });
  }

  /* =========================================================
     5. SCROLL REVEAL ANIMATIONS
     ========================================================= */
  if (hasIO) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.1 });

    $$('.reveal').forEach((el) => revealObserver.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  /* =========================================================
     6. ANIMATED STAT COUNTERS
     ========================================================= */
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1600;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const current = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const counters = $$('.counter');
  if (hasIO && counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          animateCounter(en.target);
          countObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((c) => countObserver.observe(c));
  } else {
    counters.forEach((c) => { c.textContent = c.dataset.count; });
  }

  /* =========================================================
     7. INTERACTIVE "LIVE QA TEST RUNNER" CONSOLE
     ========================================================= */
  const termBody = $('#terminalBody');
  const runBtn = $('#runTestBtn');
  const clearBtn = $('#clearTestBtn');
  const termTabs = $$('.terminal-tab');

  const testSuites = {
    'suite-1': {
      cmd: 'pytest tests/api/test_skyvat_endpoints.py -v --html=report.html',
      logs: [
        { type: 'info', text: 'Platform: Windows | Python 3.11.4 | Pytest 8.2.1 | Requests 2.31' },
        { type: 'info', text: 'Collected 169 endpoints across 46 business modules...' },
        { type: 'pass', text: '[12%] PASSED tests/api/test_auth.py::test_obtain_valid_jwt_token [200 OK - 18ms]' },
        { type: 'pass', text: '[24%] PASSED tests/api/test_auth.py::test_reject_expired_bearer_token [401 UNAUTHORIZED - 11ms]' },
        { type: 'pass', text: '[38%] PASSED tests/api/test_vat.py::test_mushak_6_3_calculation_rules [200 OK - 24ms]' },
        { type: 'pass', text: '[55%] PASSED tests/api/test_inventory.py::test_stock_transfer_isolation [201 CREATED - 31ms]' },
        { type: 'pass', text: '[72%] PASSED tests/api/test_security.py::test_cross_branch_data_isolation [403 FORBIDDEN - 9ms]' },
        { type: 'pass', text: '[89%] PASSED tests/api/test_bulk.py::test_bulk_excel_import_schema [200 OK - 42ms]' },
        { type: 'pass', text: '[100%] PASSED tests/api/test_tax.py::test_vat_rebate_9_1_reconciliation [200 OK - 26ms]' },
        { type: 'highlight', text: '==================== 169 PASSED in 1.48s (100% SUCCESS) ====================' }
      ]
    },
    'suite-2': {
      cmd: 'pytest tests/security/test_jwt_and_rbac.py -v',
      logs: [
        { type: 'info', text: 'Executing Security & Role-Based Access Control Checks...' },
        { type: 'pass', text: '✓ [AuthGate] 401 Unauthorized returned when Authorization header missing' },
        { type: 'pass', text: '✓ [TokenExpiry] 401 Unauthorized on expired JWT signature' },
        { type: 'pass', text: '✓ [RoleElevation] 403 Forbidden when standard user hits /api/admin/roles' },
        { type: 'pass', text: '✓ [DataLeakage] Branch A tenant cannot query Branch B invoice ledgers' },
        { type: 'pass', text: '✓ [SQLSanitization] Escapes illegal SQL query strings in search parameter' },
        { type: 'highlight', text: '==================== 5/5 SECURITY GATES PASSED ====================' }
      ]
    },
    'suite-3': {
      cmd: 'python scripts/verify_vat_mushak_formulas.py --precision=4',
      logs: [
        { type: 'info', text: 'Validating NBR Tax Calculations against Transaction Ledgers...' },
        { type: 'info', text: 'Testing Sales Line Items with fractional quantities (BOM batch #408)...' },
        { type: 'pass', text: '✓ Raw Material Procurement tax accurately tracked in Mushak 6.1 Register' },
        { type: 'pass', text: '✓ 15% Standard VAT equation verified: (Price × 0.15) with zero rounding drift' },
        { type: 'pass', text: '✓ VDS (Tax Deducted at Source) challan calculation matches NBR deduction table' },
        { type: 'pass', text: '✓ Monthly net payable in Mushak 9.1 matches sum of daily sales records' },
        { type: 'highlight', text: '==================== ZERO FINANCIAL DISCREPANCIES FOUND ====================' }
      ]
    },
    'suite-4': {
      cmd: 'k6 run --vus 500 --duration 1m load_test_skysms_apis.js',
      logs: [
        { type: 'info', text: 'Ramping up 500 Virtual Users against SkySMS Gateway API...' },
        { type: 'info', text: 'Dispatched 54,200 HTTP POST /api/v1/sms/dispatch requests' },
        { type: 'pass', text: '✓ http_req_duration..............: avg=142ms  min=45ms  med=120ms  p(95)=210ms' },
        { type: 'pass', text: '✓ http_req_failed................: 0.00% (0 errors out of 54,200 requests)' },
        { type: 'pass', text: '✓ http_reqs......................: 1,840/s peak throughput' },
        { type: 'highlight', text: '==================== LOAD BENCHMARK PASSED (SLA MET) ====================' }
      ]
    }
  };

  let activeSuiteKey = 'suite-1';
  let isRunning = false;

  const runTestSuite = (suiteKey) => {
    if (isRunning || !termBody) return;
    isRunning = true;
    if (runBtn) runBtn.disabled = true;

    termBody.innerHTML = '';
    const suite = testSuites[suiteKey];

    // Initial command line
    const promptLine = document.createElement('div');
    promptLine.className = 'term-line';
    promptLine.innerHTML = `<span class="term-prompt">$</span><span>${suite.cmd}</span>`;
    termBody.appendChild(promptLine);

    suite.logs.forEach((log, index) => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'term-line';
        
        if (log.type === 'pass') {
          line.innerHTML = `<span class="term-pass">${log.text}</span>`;
        } else if (log.type === 'highlight') {
          line.innerHTML = `<span class="term-pass" style="font-weight:700">${log.text}</span>`;
        } else {
          line.innerHTML = `<span class="term-info">${log.text}</span>`;
        }

        termBody.appendChild(line);
        termBody.scrollTop = termBody.scrollHeight;

        if (index === suite.logs.length - 1) {
          isRunning = false;
          if (runBtn) runBtn.disabled = false;
        }
      }, (index + 1) * 220);
    });
  };

  if (termTabs.length) {
    termTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        if (isRunning) return;
        termTabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        activeSuiteKey = tab.dataset.suite;
        runTestSuite(activeSuiteKey);
      });
    });
  }

  if (runBtn) {
    runBtn.addEventListener('click', () => runTestSuite(activeSuiteKey));
  }

  if (clearBtn && termBody) {
    clearBtn.addEventListener('click', () => {
      if (isRunning) return;
      termBody.innerHTML = `<div class="term-line"><span class="term-prompt">$</span><span class="term-info">Console cleared. Click "Run Test Suite" to simulate live test execution.</span></div>`;
    });
  }

  // Auto-run first suite once visible
  if (hasIO && termBody) {
    const termObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          runTestSuite('suite-1');
          termObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    termObserver.observe(termBody);
  }

  /* =========================================================
     8. PROJECTS FILTERING
     ========================================================= */
  const filterBtns = $$('.filter-btn');
  const projectCards = $$('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });

      projectCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !matches);
        if (matches) {
          card.classList.remove('is-entering');
          void card.offsetWidth; // trigger reflow
          card.classList.add('is-entering');
        }
      });
    });
  });

  /* =========================================================
     9. PROJECT DETAILS MODAL & LIGHTBOX
     ========================================================= */
  const pmodal = $('#projectModal');
  const lightbox = $('#lightbox');
  const lbImg = $('#lightboxImg');
  const lbCaption = $('#lightboxCaption');
  const lbPrev = $('#lightboxPrev');
  const lbNext = $('#lightboxNext');

  let activeProject = null;
  let modalReturnFocus = null;

  const openProjectModal = (card) => {
    if (!card || !pmodal) return;
    activeProject = card;
    modalReturnFocus = document.activeElement;

    const details = $('.project__details', card);
    const title = $('h3', card)?.textContent || '';
    const category = $('.badge', card)?.textContent || '';
    const id = $('.mono-label', card)?.textContent || 'PRJ';
    const subtitle = $('.project-card__title p', card)?.textContent || $('.featured-stack', card)?.textContent || '';

    $('#pmId').textContent = id;
    $('#pmCat').textContent = category;
    $('#pmTitle').textContent = title;
    $('#pmType').textContent = `${subtitle} · Codezzi / Skytech Solutions`;

    if (details) {
      $('#pmOverview').textContent = $('.d-overview', details)?.textContent || '';

      const testItems = $$('.d-testing li', details).map((li) => li.textContent.trim());
      const testContainer = $('#pmTesting');
      testContainer.innerHTML = '';
      testItems.forEach((t) => {
        const sp = document.createElement('span');
        sp.textContent = t;
        testContainer.appendChild(sp);
      });

      const toolItems = $$('.d-tools li', details).map((li) => li.textContent.trim());
      const toolContainer = $('#pmTools');
      toolContainer.innerHTML = '';
      toolItems.forEach((t) => {
        const sp = document.createElement('span');
        sp.textContent = t;
        toolContainer.appendChild(sp);
      });
      $('#pmToolsBlock').hidden = toolItems.length === 0;

      const points = $$('.d-points li', details).map((li) => li.textContent.trim());
      const pointsList = $('#pmPoints');
      pointsList.innerHTML = '';
      points.forEach((p) => {
        const li = document.createElement('li');
        li.textContent = p;
        pointsList.appendChild(li);
      });

      const gitLink = $('.d-link', details)?.getAttribute('href');
      const pmLink = $('#pmLink');
      if (pmLink) {
        pmLink.hidden = !gitLink;
        if (gitLink) pmLink.href = gitLink;
      }
    }

    pmodal.hidden = false;
    document.body.classList.add('is-locked');
    pmodal.scrollTop = 0;
    $('.pmodal__close', pmodal)?.focus();
  };

  const closeProjectModal = () => {
    if (!pmodal || pmodal.hidden) return;
    pmodal.hidden = true;
    if (lightbox.hidden) document.body.classList.remove('is-locked');
    if (modalReturnFocus) modalReturnFocus.focus();
  };

  const stepProject = (direction) => {
    const visibleCards = projectCards.filter((c) => !c.classList.contains('is-hidden'));
    const list = visibleCards.length ? visibleCards : projectCards;
    const index = list.indexOf(activeProject);
    const nextIndex = (index + direction + list.length) % list.length;
    openProjectModal(list[nextIndex]);
  };

  $$('.project__open').forEach((btn) => {
    btn.addEventListener('click', () => openProjectModal(btn.closest('.project-card, .project-card--featured')));
  });

  $$('[data-close]', pmodal).forEach((btn) => btn.addEventListener('click', closeProjectModal));
  $('#pmPrev')?.addEventListener('click', () => stepProject(-1));
  $('#pmNext')?.addEventListener('click', () => stepProject(1));

  /* Lightbox Controls */
  let lbItems = [];
  let lbIndex = 0;

  const renderLightbox = () => {
    if (!lbItems.length) return;
    const item = lbItems[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCaption.textContent = `${item.alt} (${pad(lbIndex + 1)} / ${pad(lbItems.length)})`;
    lbPrev.hidden = lbNext.hidden = lbItems.length <= 1;
  };

  const openLightbox = (items, index = 0) => {
    lbItems = items;
    lbIndex = index;
    renderLightbox();
    lightbox.hidden = false;
    document.body.classList.add('is-locked');
  };

  const closeLightbox = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    if (pmodal.hidden) document.body.classList.remove('is-locked');
  };

  $('#lightboxClose')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lbPrev?.addEventListener('click', () => {
    lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
    renderLightbox();
  });

  lbNext?.addEventListener('click', () => {
    lbIndex = (lbIndex + 1) % lbItems.length;
    renderLightbox();
  });

  /* Keyboard Listeners */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!lightbox.hidden) closeLightbox();
      else if (!pmodal.hidden) closeProjectModal();
      else closeMenu();
    }
    if (!lightbox.hidden && lbItems.length > 1) {
      if (e.key === 'ArrowRight') {
        lbIndex = (lbIndex + 1) % lbItems.length;
        renderLightbox();
      }
      if (e.key === 'ArrowLeft') {
        lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
        renderLightbox();
      }
    }
  });

  /* =========================================================
     10. QA ARTIFACTS GALLERY (SLIDER / GRID / AUTOPLAY)
     ========================================================= */
  const galleryBox = $('#galleryRoot');
  if (galleryBox) {
    const mainImg = $('#galleryMain');
    const counter = $('#galleryCounter');
    const thumbImgs = $$('.gallery-thumb-item img', galleryBox);
    const viewToggle = $('#viewToggle');
    const prevBtn = $('#galleryPrev');
    const nextBtn = $('#galleryNext');

    const items = thumbImgs.map((img) => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || 'QA Architecture Artifact'
    }));

    let activeIndex = 0;
    let autoSlideTimer = null;

    const showArtifact = (index) => {
      activeIndex = (index + items.length) % items.length;
      mainImg.classList.add('is-fading');

      setTimeout(() => {
        mainImg.src = items[activeIndex].src;
        mainImg.alt = items[activeIndex].alt;
        mainImg.classList.remove('is-fading');
      }, 150);

      if (counter) counter.textContent = `${pad(activeIndex + 1)} / ${pad(items.length)}`;
      $$('.gallery-thumb-item', galleryBox).forEach((item, k) => {
        item.classList.toggle('is-active', k === activeIndex);
      });
    };

    const isGrid = () => galleryBox.classList.contains('is-grid');
    const stopAutoSlide = () => { if (autoSlideTimer) clearInterval(autoSlideTimer); };
    const startAutoSlide = () => {
      stopAutoSlide();
      autoSlideTimer = setInterval(() => {
        if (!isGrid() && lightbox.hidden) showArtifact(activeIndex + 1);
      }, 6000);
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { showArtifact(activeIndex - 1); startAutoSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { showArtifact(activeIndex + 1); startAutoSlide(); });

    mainImg?.addEventListener('click', () => openLightbox(items, activeIndex));

    $$('.gallery-thumb-item', galleryBox).forEach((thumb, k) => {
      thumb.addEventListener('click', () => {
        if (isGrid()) openLightbox(items, k);
        else {
          showArtifact(k);
          startAutoSlide();
        }
      });
    });

    if (viewToggle) {
      viewToggle.addEventListener('click', () => {
        const gridState = galleryBox.classList.toggle('is-grid');
        viewToggle.setAttribute('aria-pressed', String(gridState));
        const textSpan = $('span', viewToggle);
        if (textSpan) textSpan.textContent = gridState ? 'Slider view' : 'Grid view';
      });
    }

    galleryBox.addEventListener('mouseenter', stopAutoSlide);
    galleryBox.addEventListener('mouseleave', startAutoSlide);

    showArtifact(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      startAutoSlide();
    }
  }

  /* =========================================================
     11. INSTANT EMAIL COPY TO CLIPBOARD
     ========================================================= */
  const copyBtn = $('#copyEmailBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = 'nahinchowdhuryfci@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const badge = $('.copy-badge', copyBtn);
        if (badge) {
          const original = badge.textContent;
          badge.textContent = 'Copied!';
          badge.style.background = '#10B981';
          badge.style.color = '#FFFFFF';
          setTimeout(() => {
            badge.textContent = original;
            badge.style.background = '';
            badge.style.color = '';
          }, 2000);
        }
      } catch (err) {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  /* =========================================================
     12. DYNAMIC FOOTER YEAR
     ========================================================= */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
