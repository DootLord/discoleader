/* ═══════════════════════════════════════════════════
   DEAD AS DISCO — script.js
════════════════════════════════════════════════════ */

// ╔═══════════════════════════════════════════════╗
// ║            ★  EDIT SCORES HERE  ★            ║
// ║                                               ║
// ║  Each song has an array of players.           ║
// ║  Change 'score' values to update the board.   ║
// ║  Add a new { } entry to add a player.         ║
// ║  'avatar' is the path to their image —        ║
// ║   leave as '' if they have no image yet.      ║
// ╚═══════════════════════════════════════════════╝
const SCORES = {
  // ── SONG 1: ECHOLOKATORS ────────────────────
  1: [
    { name: 'DootLord', avatar: 'assets/images/dootlord.webp', score: 81584 },
    { name: 'PvMayo',   avatar: 'assets/images/PvMayo.webp',   score: 80980 },
    // { name: 'NewPlayer', avatar: 'assets/images/newplayer.webp', score: 50000 },
  ],
  // ── SONG 2: MANIAC ──────────────────────────
  2: [
    { name: 'PvMayo',   avatar: 'assets/images/PvMayo.webp',   score: 96240 },
    { name: 'DootLord', avatar: 'assets/images/dootlord.webp', score: 90844 },
    
  ],
  // ── SONG 3 ──────────────────────────────────
  3: [],
  // ── SONG 4 ──────────────────────────────────
  4: [],
};

// ─── SONG CONFIG ─────────────────────────────────
const SONG_CONFIG = {
  1: { name: 'ECHOLOKATORS', color: '#00e5ff', audioId: 'audio-1', theme: ''     },
  2: { name: 'MANIAC',       color: '#39ff14', audioId: 'audio-2', theme: 'punk' },
  3: { name: 'SONG 3',       color: '#a020f0', audioId: null,       theme: ''     },
  4: { name: 'SONG 4',       color: '#ffd700', audioId: null,       theme: ''     },
};

// ─── LEADERBOARD RENDERER ────────────────────────
function renderLeaderboard(songIdx) {
  const container = document.getElementById(`leaderboard-${songIdx}`);
  if (!container) return;

  const players = (SCORES[songIdx] || []).slice().sort((a, b) => b.score - a.score);
  const theme   = SONG_CONFIG[songIdx].theme;
  const isPunk  = theme === 'punk';
  const topScore = players[0]?.score || 1;

  container.innerHTML = players.map((p, i) => {
    const rank   = i + 1;
    const pct    = topScore > 0 ? Math.round((p.score / topScore) * 100) : 0;
    const isFirst = rank === 1;
    const avatarHtml = p.avatar
      ? `<img src="${p.avatar}" alt="${p.name}" />`
      : `<div class="avatar-placeholder">${p.name[0]}</div>`;

    return `
    <div class="player-card rank-${rank}${isPunk ? ' punk-card' : ''}" data-rank="${rank}">
      <div class="rank-badge">${rank}</div>
      <div class="player-avatar">
        ${avatarHtml}
        <div class="avatar-glow${isPunk ? ' avatar-glow--punk' : ''}"></div>
      </div>
      <div class="player-info">
        <span class="player-name">${p.name}</span>
        <div class="score-bar-wrap">
          <div class="score-bar${isPunk ? ' score-bar--punk' : ''}" style="--pct:${pct}%"></div>
        </div>
      </div>
      <div class="player-score">
        <span class="score-num${isPunk ? ' punk-score' : ''}" data-score="${p.score}">${p.score.toLocaleString()}</span>
        <span class="score-label">PTS</span>
      </div>
      ${isFirst ? '<div class="crown-icon">👑</div>' : ''}
    </div>`;
  }).join('');
}


let currentAudio  = document.getElementById('audio-1');
let isPlaying     = false;
const playBtn     = document.getElementById('play-btn');
const waveform    = document.getElementById('waveform');
const trackLabel  = document.getElementById('track-label');
const audioBar    = document.getElementById('audio-bar');

function setPlaying(state) {
  isPlaying = state;
  playBtn.textContent = isPlaying ? '⏸' : '▶';
  waveform.classList.toggle('paused', !isPlaying);
}

playBtn.addEventListener('click', () => {
  if (!currentAudio || !currentAudio.src || currentAudio.src === window.location.href) return;
  if (isPlaying) {
    currentAudio.pause();
    setPlaying(false);
  } else {
    currentAudio.play().then(() => setPlaying(true)).catch(() => {});
  }
});

function switchAudio(songIdx) {
  const cfg = SONG_CONFIG[songIdx];

  // Stop anything currently playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  setPlaying(false);

  // Update bar colour
  audioBar.style.setProperty('--current-song-color', cfg.color);
  trackLabel.textContent = cfg.name;

  if (cfg.audioId) {
    const newAudio = document.getElementById(cfg.audioId);
    if (newAudio && newAudio.src && newAudio.getAttribute('src')) {
      currentAudio = newAudio;
      currentAudio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      currentAudio = null;
    }
  } else {
    currentAudio = null;
  }
}

// ─── TAB SWITCHING ───────────────────────────────
const tabs   = document.querySelectorAll('.song-tab');
const panels = document.querySelectorAll('.song-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.classList.contains('locked')) return;

    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const idx = parseInt(tab.dataset.song, 10);
    const target = document.getElementById(`song-panel-${idx}`);
    if (target) {
      target.classList.add('active');
      renderLeaderboard(idx);
      animateScoreBars(target);
      animateCounters(target);
    }
    switchAudio(idx);
  });
});

// ─── SCORE BAR ANIMATION ─────────────────────────
function animateScoreBars(panel) {
  panel.querySelectorAll('.score-bar').forEach(bar => {
    bar.style.animation = 'none';
    bar.offsetHeight;
    bar.style.animation = '';
  });
}

// ─── SCORE COUNTER ───────────────────────────────
function animateCounters(panel) {
  panel.querySelectorAll('.score-num').forEach(el => {
    const target = parseInt(el.dataset.score, 10);
    if (isNaN(target)) return;
    const duration = 1200;
    const start    = performance.now();
    (function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    })(start);
  });
}

// ─── LIGHTNING SPARKS ────────────────────────────
(function spawnSparks() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  setInterval(() => {
    const spark = document.createElement('span');
    const useGold = Math.random() > 0.5;
    spark.textContent = '✦';
    spark.style.cssText = `
      position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;
      font-size:${0.6+Math.random()*1.4}rem;opacity:0;pointer-events:none;z-index:1;
      color:${useGold ? `rgba(255,215,0,${0.5+Math.random()*0.5})` : `rgba(0,229,255,${0.4+Math.random()*0.6})`};
      filter:drop-shadow(0 0 6px ${useGold ? '#ffd700' : '#00e5ff'});animation:spark-pop 0.6s ease forwards;`;
    header.appendChild(spark);
    setTimeout(() => spark.remove(), 700);
  }, 400);
})();

const style = document.createElement('style');
style.textContent = `
@keyframes spark-pop {
  0%   { opacity:0; transform:scale(0.3) translateY(0); }
  40%  { opacity:1; transform:scale(1.2) translateY(-8px); }
  100% { opacity:0; transform:scale(0.8) translateY(-18px); }
}`;
document.head.appendChild(style);

// ─── INIT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Render all leaderboards from data
  Object.keys(SCORES).forEach(idx => renderLeaderboard(parseInt(idx, 10)));

  const firstPanel = document.querySelector('.song-panel.active');
  if (firstPanel) animateCounters(firstPanel);

  // Try immediate autoplay; if blocked, start on the first user interaction
  function tryPlay() {
    if (!isPlaying && currentAudio && currentAudio.getAttribute('src')) {
      currentAudio.play().then(() => {
        setPlaying(true);
        // Clean up listeners once playback starts
        ['click', 'keydown', 'touchstart'].forEach(e =>
          document.removeEventListener(e, tryPlay));
      }).catch(() => {});
    }
  }

  tryPlay();
  ['click', 'keydown', 'touchstart'].forEach(e =>
    document.addEventListener(e, tryPlay, { once: true }));
});
