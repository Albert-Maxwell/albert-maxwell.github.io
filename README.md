# Albert-Maxwell — Event-driven research lab

The website for Albert-Maxwell, served at https://www.albert-maxwell.com/. The site positions the firm as an event-driven research lab: we forecast the minutes after an event and trade them at low latency, on infrastructure that rewrites itself as its models decay.

## Design

The page follows the Modernist design system: everything set in Archivo, a near-white ground with a single red accent, a visible modular grid, zero corner radius and strong 2px rules. All colors, fonts and spacing come from the CSS custom properties at the top of `css/styles.css` — retune the look there rather than hard-coding values in the markup.

## Structure

```
albert-maxwell.github.io
├── CNAME
├── README.md
├── css
│   └── styles.css
├── fonts
│   └── archivo-latin.woff2
├── images
│   └── albert-maxwell-logo-square.png
├── index.html
└── tests
    └── test_static_site.py
```

The site is a single static page with no JavaScript, no build step and no external dependencies — the Archivo variable font is self-hosted from `fonts/`.

## Testing

`tests/test_static_site.py` checks that HTML ids are unique, that local links and fragments resolve, and that every asset referenced from CSS exists. CI also runs an offline link check with lychee. Run the tests locally with:

```
python -m unittest discover -s tests -p 'test_*.py'
```

## Deployment

GitHub Pages publishes the repository root directly from the `main` branch — a push to `main` redeploys the site. The custom domain is configured through `CNAME` and the repository's Pages settings, with HTTPS enforced.

© 2026 Albert-Maxwell. All rights reserved.
