const GITHUB_USER = 'qusamulab';
const TOOL_REPOS = ['fuin', 'memdroid', 'enma', 'shirayuki', 'kagura', 'shingan', 'pypproxy', 'aioq'];

function typeWriter(el, text, speed = 28) {
  el.textContent = '';
  let i = 0;
  (function tick() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(tick, speed);
    }
  })();
}

function initBioTypewriter() {
  const bioEl = document.querySelector('.bio');
  if (!bioEl) return;
  typeWriter(bioEl, bioEl.dataset.text || bioEl.textContent.trim());
}

function initMatrixRain() {
  const canvas = document.getElementById('matrix-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const fontSize = 15;
  let columns, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -50));
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.fillStyle = 'rgba(6, 10, 8, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#39ff14';
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < columns; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(draw, 60);
}

initBioTypewriter();
initMatrixRain();

async function fetchGitHubUser() {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
  if (!res.ok) return;
  const data = await res.json();
  document.getElementById('stat-repos').textContent = data.public_repos;
  document.getElementById('stat-followers').textContent = data.followers;
}

async function fetchRepoStars() {
  const results = await Promise.all(
    TOOL_REPOS.map(repo =>
      fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}`)
        .then(r => r.ok ? r.json() : null)
    )
  );

  let totalStars = 0;
  results.forEach((data, i) => {
    if (!data) return;
    totalStars += data.stargazers_count;
    const el = document.getElementById(`stars-${TOOL_REPOS[i]}`);
    if (el) el.textContent = `★ ${data.stargazers_count}`;
  });

  document.getElementById('stat-stars').textContent = totalStars;
}

fetchGitHubUser();
fetchRepoStars();
