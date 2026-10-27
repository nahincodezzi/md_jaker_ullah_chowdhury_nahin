# SQA Portfolio — Md Jaker Ullah Chowdhury Nahin

A modern, editorial-style portfolio website for a Software Quality Assurance Engineer.
Built with plain **HTML, CSS and JavaScript** — no frameworks, no build step.

## Project structure

```
sqa-portfolio/
├── index.html              ← all page content (text, links, sections)
├── css/
│   └── style.css           ← all design: colours, fonts, layout, responsive rules
├── js/
│   ├── script.js           ← intro, menu, counters, project filter, pop-up, gallery, lightbox
│   └── bg.js               ← SQA motion background
├── assets/
│   ├── images/
│   │   ├── profile.jpg     ← your photo
│   │   └── favicon.svg     ← browser tab icon
│   ├── screenshots/        ← put project screenshots here (see HOW-TO-ADD-SCREENSHOTS.txt)
│   ├── gallery/
│   │   └── photo-1.svg … photo-9.svg ← gallery placeholders (replace with your photos)
│   └── cv/
│       └── Nahin-CV.pdf    ← your CV (linked from "Download CV")
└── README.md
```

## Sections

Header → Hero (word-by-word headline, tool badges, stats, photo) → Tools strip →
The tester's view (drag the bug cards aside) → QA in action (animated test run) → About →
Testing lifecycle (6 clickable stages) → Skills → Experience → Projects (filter + pop-ups) →
How I can help (5 service cards) → Education & certifications → Gallery → Contact →
Footer with giant "I FIND THE BUGS." tagline

## How to run

Double-click `index.html` to open it in your browser.
For live reload while editing, use the **Live Server** extension in VS Code.

## How to customise

### Text
Open `index.html` and edit the text directly. Each section is marked with a comment like
`<!-- ===== ABOUT ===== -->`. All content comes from your CV; the only placeholders left are
your photo, the project screenshots and the gallery photos.

The italic teal words in headings are wrapped in `<em>…</em>` — move the `<em>` tags to
highlight different words.

### Stat counters
In the hero, `data-count` sets each number (11 products, 169 endpoints, 46 modules). The counters animate up to them.

### Images
Your photo is `assets/images/profile.jpg`. To change it, replace the file with another
portrait photo (4:5 works best, e.g. 960×1200) and keep the same name.

Gallery photos live in `assets/gallery/`. Replace the placeholders and update the `src`
and `alt` text in the Gallery section of `index.html`. Compress photos at https://tinypng.com first.

### Codezzi-inspired sections
- **Bug stack** (`#bugs`): five illustrative bug reports. Drag the top card aside (mouse or touch) or press
  "Fix the next bug"; when all are gone, "0 open critical bugs · Release ready" is revealed. Edit the
  `<article class="bug-card">` blocks to change them.
- **Testing lifecycle** (`#process`): click a stage (or use the arrow keys) to show what you do and the key
  artifacts. Edit the `<template class="phase-data">` blocks — one per stage, same order as the buttons.
- **How I can help** (`#services`): five service cards with "Best for" lists.
- **Hero badges:** the round tool badges under the buttons; hover or focus shows the tool name.
- **Footer tagline:** the giant outlined "I FIND THE BUGS." with a scan of light sweeping across it.

### Glass design
Cards, header, tools bar and footer use frosted glass so the motion background shows through.
Adjust it at the bottom of `css/style.css` (the GLASS THEME block):

```css
--glass: rgba(255, 255, 255, 0.52);   /* lower = more see-through */
--glass-blur: blur(16px) saturate(160%);
```

Browsers without blur support automatically fall back to near-solid white cards.

### Motion background
`js/bg.js` draws a live background behind the whole site on one `<canvas>`:
soft colour glows drifting slowly, a dot grid that lights up around the cursor, floating test signals (`200 OK`, `✓ test_login`,
`p95 < 300ms`, `k6 run load.js` …), a QA scan beam sweeping down the screen, and small bugs that
turn into green checks when the beam finds them.

- **Change the labels:** edit the `TOKENS` list at the top of `js/bg.js`.
- **Make it stronger or softer:** in `drawTokens()` change `0.09 + tk.depth * 0.15` (token opacity),
  and in `drawScan()` change the `0.05` / `0.22` values.
- **Turn it off:** delete the `<canvas id="qaBg">` line near the top of `index.html`.

It pauses when the tab is hidden, uses fewer elements on phones, and shows a still frame for
visitors who prefer reduced motion. It follows the `--accent-rgb` colour in `css/style.css`.

### QA in action animation
The "QA in action" section plays a looping animation of a test run: the suite runs, one test
fails, a bug ticket is logged, the fix is retested and the release is marked ready. It is pure
HTML/CSS/JS (no video file), pauses when scrolled off screen, has a Pause/Play button and shows
the finished state for visitors who prefer reduced motion.

To change the test names or rows, edit the `.qa-row` blocks in `index.html` and the `LINES`
list in `js/script.js` (search for "QA in action").

**Using your own video instead:** save it as `assets/video/qa-demo.mp4` (MP4, under ~10 MB) and,
in `index.html`, replace the `<div class="qa-demo" …>` block with:

```html
<video class="qa-video" src="assets/video/qa-demo.mp4" controls muted playsinline preload="metadata"></video>
```

### Project screenshots
Drop images into `assets/screenshots/` named after the project, numbered from 1:

```
skyvat-1.png   skyvat-2.png   skyvat-3.jpg   …   (up to 12 per project)
```

Project names: `api-automation`, `skyvat`, `skycrm`, `skysms`, `skydatamanager`, `hiring-desk`,
`google-ads-manager`, `prime-bank-foundation`, `baf`, `codezzi-website`, `jonosheba`, `donor-connect`.
`.png`, `.jpg`, `.jpeg` and `.webp` all work.

Each card shows the first 3 screenshots (with "+N" if there are more). Clicking one opens the
project's details pop-up at that screenshot, where all of them can be browsed. Projects without
screenshots show no image area. Blur any client or personal data before publishing.

> Screenshots load when the site is opened from a web server or published online (GitHub Pages,
> Netlify, Vercel). Most browsers also load them when you open `index.html` directly.

### Project details pop-up
Every project card has a **View details** button. It opens a pop-up with the project overview,
testing performed, tools, key validation points, all its screenshots (with thumbnails) and
Previous/Next buttons to move between projects. Clicking the big screenshot opens it full size.

The pop-up text comes from the hidden block inside each card in `index.html`:

```html
<div class="project__details" hidden>
  <p class="d-overview">Short summary of the project…</p>
  <ul class="d-testing"><li>Functional</li><li>Regression</li></ul>   <!-- testing performed -->
  <ul class="d-tools"><li>Postman</li></ul>                           <!-- leave empty to hide Tools -->
  <ul class="d-points"><li>What you validated…</li></ul>
  <a class="d-link" href="https://github.com/…">View on GitHub</a>   <!-- optional -->
</div>
```

Edit the text there; the pop-up updates automatically.

### Projects and filter
Each project card has `data-category="biz"` (business software), `web` (websites & CMS) or
`auto` (automation), matching the filter buttons' `data-filter`. Copy an `<article class="project">`
block to add a project.

### Gallery
Add or remove `<img>` tags inside `<div id="galleryThumbs">`. The slider, counter,
grid view and lightbox update automatically.

### Intro splash
It shows once per visit. To remove it, delete the `INTRO SPLASH` block at the top of `index.html`.

### CV
Your CV is already at `assets/cv/Nahin-CV.pdf` (with the portfolio link mdjakerullahchowdhurynahin.vercel.app in the header). To update it, replace that file and keep the same name.

### Colours
The site uses a light, professional theme. Open `css/style.css` and change the variables at the top:

```css
--accent: #0F766E;           /* main colour (deep teal) */
--accent-dark: #115E59;      /* hover colour */
--accent-rgb: 15, 118, 110;  /* same colour as RGB */
--accent-soft: #E6F2F1;      /* light tint for chips and icon boxes */
--bg: #F6F8FB;               /* page background */
```

Other professional accents: blue `#1D4ED8` (RGB 29, 78, 216), cyan `#0E7490` (RGB 14, 116, 144),
indigo `#4338CA` (RGB 67, 56, 202). Update `--accent-rgb` and `--accent-soft` to match.

### Fonts
- **Plus Jakarta Sans** — headings
- **Lexend** — body text (designed for comfortable reading)
- **IBM Plex Mono** — labels, dates and the terminal panel

To change them, edit the Google Fonts `<link>` in `index.html` and the `--font-*` variables in `css/style.css`.

### Links
Email and GitHub are already set. To add LinkedIn, copy the GitHub contact card in the Contact section and change the link.

## Publish it online (free)

Your live site: **https://mdjakerullahchowdhurynahin.vercel.app/** (the link in your CV).

To update it on **Vercel**:
- If the project is connected to a GitHub repo: replace the files in the repo and push — Vercel redeploys automatically.
- If you uploaded it directly: run `npx vercel --prod` inside the `sqa-portfolio` folder, or drag the folder into a new deployment on vercel.com.

Other free options: GitHub Pages or Netlify Drop (https://app.netlify.com/drop).

## Features

- Codezzi-inspired layout: arrow-marked section labels, word-by-word hero, draggable bug stack, clickable testing lifecycle, service cards and a giant footer tagline
- Frosted-glass design over a live SQA motion background
- Light, professional design with a QA flavour: release status card, QA process steps, test-case style project cards and a terminal-style automation summary
- SQA motion background: cursor-lit dot grid, floating test signals, scan beam and bugs that become checks
- "QA in action" animated test run (failing test → bug ticket → retest → release ready) with Pause/Play
- Skippable intro splash, animated stat counters, scroll-reveal animations
- Filterable projects with drop-in screenshots (up to 12 each)
- Project details pop-up with overview, testing types, tools, validation points and a screenshot viewer
- Gallery with slider, grid view and lightbox
- Fully responsive with a mobile menu
- Accessible: keyboard focus styles, alt text, ARIA labels, reduced-motion support
- SEO meta tags and favicon
