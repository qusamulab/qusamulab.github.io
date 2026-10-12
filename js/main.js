// Fills in live GitHub numbers. The page reads fine without this script:
// every number starts as "–" and stays that way if the API is unreachable.

const GITHUB_USER = 'qusamulab';
const CACHE_KEY = `gh:${GITHUB_USER}`;
const CACHE_TTL_MS = 60 * 60 * 1000;

// Unauthenticated GitHub API calls are limited to 60 per hour per IP, so we
// make two calls (profile + repo list) and cache the result for an hour.
async function loadGitHubData() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.data;
  } catch {
    // Corrupt cache or storage disabled: fall through and fetch.
  }

  const [user, repos] = await Promise.all([
    fetchJSON(`https://api.github.com/users/${GITHUB_USER}`),
    fetchJSON(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner`),
  ]);

  const stars = {};
  for (const repo of repos) {
    if (!repo.fork) stars[repo.name] = repo.stargazers_count;
  }
  const data = {
    repos: user.public_repos,
    followers: user.followers,
    stars,
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage full or disabled: the page still works, just without caching.
  }
  return data;
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

function setText(selector, value) {
  for (const el of document.querySelectorAll(selector)) el.textContent = value;
}

function render(data) {
  const totalStars = Object.values(data.stars).reduce((sum, n) => sum + n, 0);
  setText('[data-stat="repos"]', data.repos);
  setText('[data-stat="stars"]', totalStars);
  setText('[data-stat="followers"]', data.followers);

  for (const el of document.querySelectorAll('[data-stars]')) {
    const n = data.stars[el.dataset.stars];
    if (n !== undefined) el.textContent = `★ ${n}`;
  }
}

function initFilters() {
  const buttons = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      for (const b of buttons) b.setAttribute('aria-pressed', String(b === button));
      for (const card of cards) {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      }
    });
  }
}

initFilters();
loadGitHubData().then(render).catch((err) => console.warn('GitHub stats unavailable:', err));
