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
│   └── script.js           ← intro, menu, counters, project filter, gallery, lightbox
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

Header with your full name → Hero ("I find the bugs before your users do.", photo, release QA status card, stat counters) → Tools →
About (with quick facts) → QA process → Skills → Experience timeline →
Projects (featured automation project + 9 tested products as test-case style cards, with filter) →
Education & certifications → Gallery → Contact → Footer

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
In the hero, `data-count` sets each number (9 products, 169 endpoints, 46 modules). The counters animate up to them.

### Images
Your photo is `assets/images/profile.jpg`. To change it, replace the file with another
portrait photo (4:5 works best, e.g. 960×1200) and keep the same name.

Gallery photos live in `assets/gallery/`. Replace the placeholders and update the `src`
and `alt` text in the Gallery section of `index.html`. Compress photos at https://tinypng.com first.

### Project screenshots
Drop images into `assets/screenshots/` named after the project, numbered from 1:

```
skyvat-1.png   skyvat-2.png   skyvat-3.jpg   …   (up to 12 per project)
```

Project names: `api-automation`, `skyvat`, `skycrm`, `skysms`, `skydatamanager`, `hiring-desk`,
`google-ads-manager`, `prime-bank-foundation`, `baf`, `codezzi-website`.
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
Your CV is already at `assets/cv/Nahin-CV.pdf`. To update it, replace that file and keep the same name.

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

- **GitHub Pages:** create a repo, upload these files, then Settings → Pages → Deploy from branch `main`.
- **Netlify:** go to https://app.netlify.com/drop and drag the `sqa-portfolio` folder in.
- **Vercel:** import the GitHub repo at https://vercel.com/new.

## Features

- Light, professional design with a QA flavour: release status card, QA process steps, test-case style project cards and a terminal-style automation summary
- Skippable intro splash, animated stat counters, scroll-reveal animations
- Filterable projects with drop-in screenshots (up to 12 each)
- Project details pop-up with overview, testing types, tools, validation points and a screenshot viewer
- Gallery with slider, grid view and lightbox
- Fully responsive with a mobile menu
- Accessible: keyboard focus styles, alt text, ARIA labels, reduced-motion support
- SEO meta tags and favicon
