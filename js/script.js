/* =========================================================
   SQA Portfolio — interactions
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const pad = (n) => String(n).padStart(2, '0');
  const io = 'IntersectionObserver' in window;

  /* ---------- Intro splash (shows once per browser session) ---------- */
  const intro = $('#intro');
  if (intro) {
    const finishIntro = () => {
      intro.classList.add('is-done');
      setTimeout(() => intro.remove(), 700);
      try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    };
    let seen = false;
    try { seen = sessionStorage.getItem('introSeen') === '1'; } catch (e) {}
    if (seen) intro.remove();
    else {
      setTimeout(finishIntro, 1900);
      $('#skipIntro').addEventListener('click', finishIntro);
    }
  }

  /* ---------- Mobile menu ---------- */
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const closeMenu = () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
  });

  /* ---------- Header shadow + back to top ---------- */
  const header = $('#header');
  const toTop = $('#toTop');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
    toTop.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Reveal on scroll ---------- */
  if (io) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => ro.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Animated stat counters ---------- */
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = target; return; }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = $$('.counter');
  // The real numbers are in the HTML; start from 0 only when the count-up animation will run
  if (io && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) counters.forEach((c) => { c.textContent = '0'; });
  if (io) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => { c.textContent = c.dataset.count; });
  }

  /* ---------- Active menu link ---------- */
  const links = $$('.nav__link:not(.nav__link--cta)');
  if (io) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.map((l) => $(l.getAttribute('href'))).filter(Boolean).forEach((s) => spy.observe(s));
  }

  /* ---------- Project filter ---------- */
  const filters = $$('.filter');
  const projects = $$('.project');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      projects.forEach((p) => {
        const show = f === 'all' || p.dataset.category === f;
        p.classList.toggle('is-hidden', !show);
        if (show) {
          p.classList.remove('is-entering');
          void p.offsetWidth; // restart animation
          p.classList.add('is-entering');
        }
      });
    });
  });

  /* ---------- Lightbox (shared by gallery and project screenshots) ---------- */
  const pm = $('#projectModal');
  const lightbox = $('#lightbox');
  const lbImg = $('#lightboxImg');
  const lbCaption = $('#lightboxCaption');
  const lbPrev = $('#lightboxPrev');
  const lbNext = $('#lightboxNext');
  let lbItems = [];   // [{ src, alt }]
  let lbIndex = 0;
  let lbTitle = '';
  let lbReturnFocus = null;

  const renderLightbox = () => {
    const item = lbItems[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCaption.textContent = lbItems.length > 1
      ? `${lbTitle ? lbTitle + ' · ' : ''}${pad(lbIndex + 1)} / ${pad(lbItems.length)}`
      : lbTitle;
    lbPrev.hidden = lbNext.hidden = lbItems.length < 2;
  };
  const openLightbox = (items, index = 0, title = '') => {
    lbItems = items; lbIndex = index; lbTitle = title;
    lbReturnFocus = document.activeElement;
    renderLightbox();
    lightbox.hidden = false;
    document.body.classList.add('is-locked');
    $('#lightboxClose').focus();
  };
  const closeLightbox = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    if (!pm || pm.hidden) document.body.classList.remove('is-locked');
    if (lbReturnFocus) lbReturnFocus.focus();
  };
  const stepLightbox = (d) => {
    lbIndex = (lbIndex + d + lbItems.length) % lbItems.length;
    renderLightbox();
  };
  lbPrev.addEventListener('click', () => stepLightbox(-1));
  lbNext.addEventListener('click', () => stepLightbox(1));
  $('#lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  /* ---------- Project screenshots ----------
     Each card has <div class="shots" data-shots="skyvat">. The script looks for
     assets/screenshots/skyvat-1.png, skyvat-2.png … (also .jpg, .jpeg, .webp)
     and shows whatever it finds. No files → the area stays hidden. */
  const SHOT_DIR = 'assets/screenshots/';
  const SHOT_EXTS = ['png', 'jpg', 'jpeg', 'webp'];
  const MAX_SHOTS = 12;
  const shotMap = new WeakMap();

  const findImage = (base) => new Promise((resolve) => {
    let i = 0;
    const tryNext = () => {
      if (i >= SHOT_EXTS.length) return resolve(null);
      const src = `${base}.${SHOT_EXTS[i++]}`;
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
  });

  const loadShots = async (box) => {
    const slug = box.dataset.shots;
    const title = box.dataset.title || '';
    const found = [];
    for (let n = 1; n <= MAX_SHOTS; n++) {
      const src = await findImage(`${SHOT_DIR}${slug}-${n}`);
      if (!src) break; // stop at the first missing number
      found.push({ src, alt: `${title} screenshot ${n}` });
    }
    shotMap.set(box, found);
    if (!found.length) return;

    const visible = found.slice(0, 3);
    box.classList.add('has-shots', `has-${visible.length}`);
    visible.forEach((item, k) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'shot';
      btn.setAttribute('aria-label', `Open ${item.alt}`);
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.loading = 'lazy';
      btn.appendChild(img);
      const extra = found.length - visible.length;
      if (k === visible.length - 1 && extra > 0) {
        const more = document.createElement('span');
        more.className = 'shot__more';
        more.textContent = `+${extra}`;
        btn.appendChild(more);
      }
      btn.addEventListener('click', () => openProject(box.closest('.project'), k));
      box.appendChild(btn);
    });
  };

  /* ---------- Project details pop-up ----------
     Opens from "View details" or a card screenshot. Text comes from the
     card's hidden .project__details block; screenshots from assets/screenshots/. */
  let pmProject = null;
  let pmShots = [];
  let pmShot = 0;
  let pmReturnFocus = null;

  const fillChips = (el, items) => {
    el.innerHTML = '';
    items.forEach((t) => { const sp = document.createElement('span'); sp.textContent = t; el.appendChild(sp); });
  };
  const listText = (root, sel) => $$(sel + ' li', root).map((li) => li.textContent.trim()).filter(Boolean);

  const renderShot = () => {
    const item = pmShots[pmShot];
    $('#pmMain').src = item.src;
    $('#pmMain').alt = item.alt;
    $('#pmCounter').textContent = `${pad(pmShot + 1)} / ${pad(pmShots.length)}`;
    $$('#pmThumbs button').forEach((b, k) => b.classList.toggle('is-active', k === pmShot));
  };

  const openProject = (article, shotIndex = 0) => {
    if (!article) return;
    pmProject = article;
    const details = $('.project__details', article);
    const typeEl = $('.project__title p', article) || $('.project__stack', article);
    const idEl = $('.project__top .mono-label', article);
    const catEl = $('.project__top .badge', article) || $('.project__top .eyebrow', article);
    $('#pmId').textContent = idEl ? idEl.textContent : 'FEATURED';
    $('#pmCat').textContent = catEl ? catEl.textContent : '';
    $('#pmTitle').textContent = $('h3', article).textContent;
    const where = (details && details.dataset.where) || 'Skytech Solutions (Codezzi)';
    $('#pmType').textContent = (typeEl ? typeEl.textContent : '') + ' · ' + where;
    $('#pmOverview').textContent = details ? $('.d-overview', details).textContent : '';
    fillChips($('#pmTesting'), details ? listText(details, '.d-testing') : []);
    const tools = details ? listText(details, '.d-tools') : [];
    fillChips($('#pmTools'), tools);
    $('#pmToolsBlock').hidden = tools.length === 0;
    const pts = $('#pmPoints');
    pts.innerHTML = '';
    (details ? listText(details, '.d-points') : []).forEach((t) => { const li = document.createElement('li'); li.textContent = t; pts.appendChild(li); });
    const link = details && $('.d-link', details);
    $('#pmLink').hidden = !link;
    if (link) { $('#pmLink').href = link.getAttribute('href'); $('#pmLink').textContent = link.textContent.trim() + ' →'; }

    const box = $('.shots', article);
    pmShots = (box && shotMap.get(box)) || [];
    pmShot = Math.min(shotIndex, Math.max(pmShots.length - 1, 0));
    $('.pmodal__body', pm).classList.toggle('no-media', pmShots.length === 0);
    pm.classList.toggle('is-portrait', !!(box && box.classList.contains('shots--portrait')));
    $('#pmMedia').hidden = pmShots.length === 0;
    const thumbs = $('#pmThumbs');
    thumbs.innerHTML = '';
    thumbs.hidden = pmShots.length < 2;
    pmShots.forEach((item, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Show screenshot ${k + 1}`);
      const im = document.createElement('img'); im.src = item.src; im.alt = '';
      b.appendChild(im);
      b.addEventListener('click', () => { pmShot = k; renderShot(); });
      thumbs.appendChild(b);
    });
    if (pmShots.length) renderShot();

    if (pm.hidden) {
      pmReturnFocus = document.activeElement;
      pm.hidden = false;
      document.body.classList.add('is-locked');
    }
    pm.scrollTop = 0;
    $('.pmodal__close', pm).focus();
  };

  const closeProject = () => {
    if (pm.hidden) return;
    pm.hidden = true;
    if (lightbox.hidden) document.body.classList.remove('is-locked');
    if (pmReturnFocus) pmReturnFocus.focus();
  };

  const stepProject = (d) => {
    const visible = projects.filter((p) => !p.classList.contains('is-hidden'));
    const list = visible.length ? visible : projects;
    const i = list.indexOf(pmProject);
    openProject(list[(i + d + list.length) % list.length], 0);
  };

  $$('.project__open').forEach((b) => b.addEventListener('click', () => openProject(b.closest('.project'))));
  $$('[data-close]', pm).forEach((b) => b.addEventListener('click', closeProject));
  $('#pmPrev').addEventListener('click', () => stepProject(-1));
  $('#pmNext').addEventListener('click', () => stepProject(1));
  $('#pmMainBtn').addEventListener('click', () => {
    if (pmShots.length) openLightbox(pmShots, pmShot, $('#pmTitle').textContent);
  });
  // Keep keyboard focus inside the pop-up
  pm.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('button:not([tabindex="-1"]), a[href]', pm).filter((el) => !el.closest('[hidden]') && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  $$('.shots[data-shots]').forEach(loadShots);

  /* ---------- Gallery: slider, thumbnails, grid, autoplay ---------- */
  const galleryRoot = $('#galleryRoot');
  if (galleryRoot) {
    const main = $('#galleryMain');
    const counter = $('#galleryCounter');
    const thumbs = $$('#galleryThumbs img');
    const toggle = $('#viewToggle');
    const items = thumbs.map((t) => ({ src: t.getAttribute('src'), alt: t.alt }));
    let index = 0;
    let timer = null;

    const show = (i) => {
      index = (i + thumbs.length) % thumbs.length;
      main.classList.add('is-fading');
      setTimeout(() => {
        main.src = items[index].src;
        main.alt = items[index].alt;
        main.classList.remove('is-fading');
      }, 200);
      counter.textContent = `${pad(index + 1)} / ${pad(thumbs.length)}`;
      thumbs.forEach((th, k) => th.classList.toggle('is-active', k === index));
    };

    const isGrid = () => galleryRoot.classList.contains('is-grid');
    const stopAuto = () => { if (timer) clearInterval(timer); };
    const startAuto = () => { stopAuto(); timer = setInterval(() => { if (!isGrid() && lightbox.hidden) show(index + 1); }, 5000); };

    $('#galleryNext').addEventListener('click', () => { show(index + 1); startAuto(); });
    $('#galleryPrev').addEventListener('click', () => { show(index - 1); startAuto(); });
    main.addEventListener('click', () => openLightbox(items, index, 'Gallery'));

    thumbs.forEach((th, k) => {
      th.addEventListener('click', () => {
        if (isGrid()) openLightbox(items, k, 'Gallery');
        else { show(k); startAuto(); }
      });
    });

    toggle.addEventListener('click', () => {
      const grid = galleryRoot.classList.toggle('is-grid');
      toggle.setAttribute('aria-pressed', String(grid));
      $('span', toggle).textContent = grid ? 'Slider view' : 'Grid view';
    });

    galleryRoot.addEventListener('mouseenter', stopAuto);
    galleryRoot.addEventListener('mouseleave', startAuto);

    show(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startAuto();

    // Arrow keys move the slider when it is on screen
    document.addEventListener('keydown', (e) => {
      if (!lightbox.hidden || isGrid()) return;
      const r = galleryRoot.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        if (e.key === 'ArrowRight') show(index + 1);
        if (e.key === 'ArrowLeft') show(index - 1);
      }
    });
  }

  /* ---------- Keyboard: Escape and lightbox arrows ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!lightbox.hidden) closeLightbox();
      else { closeProject(); closeMenu(); }
    }
    if (!lightbox.hidden && lbItems.length > 1) {
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
    }
  });

  /* ---------- QA in action: animated test run ----------
     One step about every second, 15 steps per loop. Pauses when off screen,
     has a Pause/Play button and shows the finished state for reduced motion. */
  const qa = $('#qaDemo');
  if (qa) {
    const rowsEl = $$('.qa-row', qa);
    const linesEl = $('#qaLines');
    const ticket = $('#qaTicket');
    const toggleBtn = $('#demoToggle');
    const ROWS = [
      { pass: 2, testing: [1] },
      { pass: 3, testing: [2] },
      { pass: 4, testing: [3] },
      { pass: 8, testing: [4, 7], fail: [5, 6] },
      { pass: 9, testing: [8] }
    ];
    const LINES = [
      { at: 0, a: '$ pytest tests/ --html=report.html', b: '', k: 'cmd' },
      { at: 1, a: 'collected 5 items', b: '', k: 'info' },
      { at: 2, a: 'test_login_valid_user', b: 'PASSED', k: 'pass' },
      { at: 3, a: 'test_missing_token_returns_401', b: 'PASSED', k: 'pass' },
      { at: 4, a: 'test_invoice_required_fields', b: 'PASSED', k: 'pass' },
      { at: 5, a: 'test_vat_total_calculation', b: 'FAILED', k: 'fail' },
      { at: 6, a: '→ BUG-001 logged with steps + screenshot', b: '', k: 'note' },
      { at: 7, a: '→ fix deployed · re-running failed test', b: '', k: 'note' },
      { at: 8, a: 'test_vat_total_calculation', b: 'PASSED', k: 'pass' },
      { at: 9, a: 'test_list_pagination', b: 'PASSED', k: 'pass' },
      { at: 10, a: '5 passed · report.html saved', b: '✓', k: 'sum' }
    ];
    const STEPS = 15;
    let step = 0;
    let timer = null;
    let userPaused = false;
    let onScreen = false;

    const render = () => {
      let passed = 0;
      ROWS.forEach((r, i) => {
        const el = rowsEl[i];
        const isPass = step >= r.pass;
        const isFail = !isPass && (r.fail || []).includes(step);
        const isTesting = !isPass && !isFail && r.testing.includes(step);
        if (isPass) passed++;
        el.classList.toggle('is-pass', isPass);
        el.classList.toggle('is-fail', isFail);
        el.classList.toggle('is-testing', isTesting);
        $('.qa-row__status', el).textContent = isPass ? 'PASSED' : isFail ? 'FAILED' : isTesting ? 'TESTING' : 'QUEUED';
      });

      // Terminal: rebuild only when the number of visible lines changes
      const visible = LINES.filter((l) => step >= l.at);
      if (linesEl.children.length !== visible.length) {
        linesEl.innerHTML = '';
        visible.forEach((l) => {
          const row = document.createElement('div');
          row.className = `qa-line qa-line--${l.k}`;
          const a = document.createElement('span'); a.textContent = l.a;
          const b = document.createElement('span'); b.textContent = l.b;
          row.append(a, b);
          linesEl.appendChild(row);
        });
      }

      // Bug ticket
      const showTicket = step >= 6 && step <= 9;
      ticket.hidden = !showTicket;
      ticket.classList.toggle('is-fixed', step === 7);
      ticket.classList.toggle('is-verified', step >= 8);
      $('#qaTicketStatus').textContent = step >= 8 ? 'VERIFIED' : step === 7 ? 'FIXED' : 'OPEN';

      // Stage + progress
      const stage = $('#qaStage');
      const bug = step >= 5 && step < 8;
      const ready = step >= 10;
      stage.classList.toggle('is-bug', bug);
      stage.classList.toggle('is-retest', step >= 8 && step < 10);
      stage.classList.toggle('is-ready', ready);
      $('#qaStageText').textContent = ready ? 'Release ready' : step >= 8 ? 'Retest passed' : bug ? '1 bug found' : 'Running tests';
      const bar = $('#qaBar');
      bar.style.width = `${(passed / ROWS.length) * 100}%`;
      bar.classList.toggle('is-bug', bug);
      bar.classList.toggle('is-ready', ready);
      $('#qaPass').textContent = `${passed} / ${ROWS.length} passed`;
    };

    const tick = () => { step = (step + 1) % STEPS; render(); };
    const start = () => { if (!timer && !userPaused && onScreen) timer = setInterval(tick, 950); };
    const stop = () => { clearInterval(timer); timer = null; };
    const setBtn = () => {
      toggleBtn.classList.toggle('is-paused', userPaused);
      $('span', toggleBtn).textContent = userPaused ? 'Play' : 'Pause';
      toggleBtn.setAttribute('aria-label', userPaused ? 'Play animation' : 'Pause animation');
    };

    toggleBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      setBtn();
      if (userPaused) stop(); else start();
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      step = 10; userPaused = true; setBtn();
    }
    render();

    if (io) {
      new IntersectionObserver((entries) => {
        onScreen = entries[0].isIntersecting;
        if (onScreen) start(); else stop();
      }, { threshold: 0.2 }).observe(qa);
    } else {
      onScreen = true; start();
    }
  }

  /* ---------- Bug stack: drag the cards aside ----------
     Drag (mouse or touch) a card far enough and it flies off. "Fix the next bug"
     does the same with one click or keyboard press; "Reset" brings them back. */
  const stack = $('#bugStack');
  if (stack) {
    const cards = $$('.bug-card', stack);          // last in markup = top of the pile
    const truth = $('.bug-truth');
    const countEl = $('#bugCount');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layout = () => {
      const open = cards.filter((c) => !c.classList.contains('is-gone'));
      open.forEach((c, i) => {
        const depth = open.length - 1 - i;           // 0 = top card
        c.style.setProperty('--r', `${[0, -4, 3, -6, 5][depth] || 0}deg`);
        c.style.setProperty('--y', `${depth * 8}px`);
        c.style.zIndex = String(10 + i);
        c.style.transform = '';
      });
      const n = open.length;
      countEl.textContent = n ? `${n} open bug${n === 1 ? '' : 's'}` : '0 open bugs · release ready';
      truth.classList.toggle('is-revealed', n === 0);
    };
    const throwCard = (card, dx = 1, dy = 0) => {
      const len = Math.hypot(dx, dy) || 1;
      card.style.transform = `translate(calc(-50% + ${(dx / len) * 640}px), calc(-50% + ${(dy / len) * 240}px)) rotate(${dx > 0 ? 24 : -24}deg)`;
      card.classList.add('is-gone');
      setTimeout(layout, reduce ? 0 : 60);
    };
    const topCard = () => [...cards].reverse().find((c) => !c.classList.contains('is-gone'));

    cards.forEach((card) => {
      let sx = 0, sy = 0, dragging = false;
      card.addEventListener('pointerdown', (e) => {
        if (card !== topCard()) return;
        dragging = true; sx = e.clientX; sy = e.clientY;
        card.classList.add('is-dragging');
        card.setPointerCapture(e.pointerId);
      });
      card.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        card.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${dx / 14}deg)`;
      });
      const end = (e) => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('is-dragging');
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.hypot(dx, dy) > 110) throwCard(card, dx, dy);
        else layout();
      };
      card.addEventListener('pointerup', end);
      card.addEventListener('pointercancel', end);
    });
    $('#bugNext').addEventListener('click', () => { const c = topCard(); if (c) throwCard(c, 1, -0.2); });
    $('#bugReset').addEventListener('click', () => { cards.forEach((c) => c.classList.remove('is-gone')); layout(); });
    layout();
  }

  /* ---------- Testing lifecycle: click a stage ---------- */
  const phases = $$('.phase');
  if (phases.length) {
    const data = $$('.phase-data').map((t) => t.content);
    const panel = $('#ph-panel');
    const select = (k, focus) => {
      const d = data[k];
      phases.forEach((b, i) => {
        b.setAttribute('aria-selected', String(i === k));
        b.tabIndex = i === k ? 0 : -1;
        b.classList.toggle('is-done', i < k);
      });
      $('#phNum').textContent = $('.pd-num', d).textContent;
      $('#phTitle').textContent = $('.pd-title', d).textContent;
      $('#phWhen').textContent = $('.pd-when', d).textContent;
      $('#phWhat').textContent = $('.pd-what', d).textContent;
      const arts = $('#phArtifacts'); arts.innerHTML = '';
      $$('.pd-artifacts li', d).forEach((li) => { const sp = document.createElement('span'); sp.textContent = li.textContent; arts.appendChild(sp); });
      $('#phaseLine').style.width = `${(k / (phases.length - 1)) * 100}%`;
      panel.classList.remove('is-switching'); void panel.offsetWidth; panel.classList.add('is-switching');
      if (focus) phases[k].focus();
    };
    phases.forEach((b, i) => {
      b.addEventListener('click', () => select(i));
      b.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % phases.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + phases.length) % phases.length, true); }
      });
    });
    select(0);
  }

  /* ---------- Current year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
});
