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
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = $$('.counter');
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
    $('#pmType').textContent = (typeEl ? typeEl.textContent : '') + ' · Skytech Solutions (Codezzi)';
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
    if (link) $('#pmLink').href = link.getAttribute('href');

    const box = $('.shots', article);
    pmShots = (box && shotMap.get(box)) || [];
    pmShot = Math.min(shotIndex, Math.max(pmShots.length - 1, 0));
    $('.pmodal__body', pm).classList.toggle('no-media', pmShots.length === 0);
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

  /* ---------- Current year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
});
