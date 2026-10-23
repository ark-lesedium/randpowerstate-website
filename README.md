# RANDPOWERSTATE website

Company site for RANDPOWERSTATE (PTY) LTD, served at randpowerstate.co.za via GitHub Pages. Static HTML, CSS and vanilla JS with no build step.

## Pages
- `index.html`: hero, who we are, proof of work (horizontal track), services, insights, testimonials, contact
- `about.html`, `services.html`, `case-studies.html` (8 clients, filterable), `insights.html`
- `insight-*.html`: three plain-language briefs
- `contact.html`: WhatsApp / call / email, mailto form, map, FAQ
- `privacy-policy.html`, `terms-of-service.html`, `404.html` (root-absolute links, since Pages serves it for any missing path)

## Assets
- `assets/css/site.css`: navy editorial design system (square edges, boxy hairline grid), shared with the founder's portfolio
- `assets/js/site.js`: nav, lightbox, floating contact, FAQ, case filters, mailto form, and the motion layer (preloader, pinned hero, split-text reveals, word sweep, counters, velocity marquee, horizontal work track, image wipes, footer wordmark fill, page transitions)
- `assets/js/vendor/`: GSAP 3.13, ScrollTrigger and Lenis, stored locally
- `assets/img/clients/`: transparent client logos; `portfolio-screens/`: live-site screenshots
- `assets/img/kimberley-night.jpg`: full-bleed hero night map (16:9) rendered from OpenStreetMap data (ODbL; keep the "© OpenStreetMap contributors" credit). The arterial roads, Big Hole outline and office pin drawn over it are inline SVG in `index.html`.

## Motion
Full motion is the default. The footer **Motion** toggle (saved per browser) switches to a calmer profile without pinning, parallax or smooth scroll. `?motion=reduced` or `?motion=full` forces either. If the scripts fail to load, the page falls back to simple CSS reveals.

## Preview locally
```
python -m http.server 8080
```
Then open http://127.0.0.1:8080. (The 404 page only kicks in on GitHub Pages; open `/404.html` directly to preview it.)
