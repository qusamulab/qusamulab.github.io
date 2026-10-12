# qusamulab.github.io

Profile page served at <https://qusamulab.github.io/>.

Plain HTML / CSS / JS with no build step — GitHub Pages serves the repository as is.

- `index.html` holds all content, so the page reads fine without JavaScript.
- `js/main.js` fills in live numbers (repositories, stars, followers) from the
  GitHub API. It makes two calls and caches them in `localStorage` for an hour,
  since unauthenticated calls are limited to 60 per hour.
- The tool list mirrors the OSS page on qusamulab.com
  (`qusamulab-site/src/data/tools.ts`). Update both together.

Preview locally with `python3 -m http.server` and open <http://localhost:8000/>.
