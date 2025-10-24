let progress = 0;
let progressInterval = null;
let SONG_DURATION = 10;
let LOOP_CURRENT = false;
let currentTitle = null;
let isSeeking = false;

async function fetchSongs({ reset = false } = {}) {
  const res = await fetch('/get_songs');
  const data = await res.json();

  const songList = document.getElementById('songList');
  const currentSong = document.getElementById('currentSong');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const totalTime = document.getElementById('totalTime');
  const loopBtn = document.getElementById('loopBtn');

  songList.innerHTML = '';
  data.songs.forEach(song => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${song.title} — ${song.artist}</span>
      <div class="buttons">
        <button onclick="selectSong('${song.title}')">▶️</button>
        <button class="delete" onclick="deleteSong('${song.title}')">🗑️</button>
      </div>
    `;
    songList.appendChild(li);
  });

  currentSong.innerHTML = `${data.current.title} — <span>${data.current.artist}</span>`;
  playPauseBtn.textContent = data.current.is_playing ? '⏸️ Pause' : '▶️ Play';

  SONG_DURATION = data.current.duration || 10;
  LOOP_CURRENT = data.current.loop_current;
  totalTime.textContent = formatTime(SONG_DURATION);
  loopBtn.style.background = LOOP_CURRENT ? '#FFD700' : 'none';

  const songChanged = currentTitle !== data.current.title;
  if (songChanged) currentTitle = data.current.title;

  const shouldReset = reset || songChanged;

  if (data.current.is_playing) startProgress(shouldReset);
  else {
    clearInterval(progressInterval);
    updateProgressUI();
  }
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function updateProgressUI() {
  const bar = document.getElementById('progressBar');
  const knob = document.getElementById('progressKnob');
  const currentTime = document.getElementById('currentTime');
  const pct = SONG_DURATION > 0 ? (progress / SONG_DURATION) * 100 : 0;

  bar.style.width = `${Math.min(100, pct)}%`;
  knob.style.left = `${Math.min(100, pct)}%`;
  currentTime.textContent = formatTime(progress);
}

// 🌈 Smooth progress animation (every 100ms)
function startProgress(reset = false) {
  clearInterval(progressInterval);
  if (reset) progress = 0;
  updateProgressUI();

  progressInterval = setInterval(async () => {
    if (isSeeking) return;

    const resState = await fetch('/get_songs');
    const stateData = await resState.json();
    if (!stateData.current.is_playing) {
      clearInterval(progressInterval);
      return;
    }

    progress += 0.1;
    updateProgressUI();

    if (progress >= SONG_DURATION) {
      clearInterval(progressInterval);
      await fetch('/next', { method: 'POST' });
      fetchSongs({ reset: true });
      return;
    }
  }, 100);
}

// 🎚️ Draggable timeline
const timeline = document.getElementById('timeline');
const knob = document.getElementById('progressKnob');

timeline.addEventListener('mousedown', e => startSeek(e));
knob.addEventListener('mousedown', e => startSeek(e));
window.addEventListener('mousemove', e => seekMove(e));
window.addEventListener('mouseup', e => endSeek(e));

function startSeek(e) {
  isSeeking = true;
  knob.classList.add('dragging'); // add scale effect
  document.body.style.cursor = "grabbing";
  updateSeek(e);
}

function seekMove(e) {
  if (!isSeeking) return;
  updateSeek(e);
}

function endSeek(e) {
  if (!isSeeking) return;
  isSeeking = false;
  knob.classList.remove('dragging'); // remove scale effect
  document.body.style.cursor = "default";
  updateSeek(e);
}

function updateSeek(e) {
  const rect = timeline.getBoundingClientRect();
  const offsetX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
  const newProgress = (offsetX / rect.width) * SONG_DURATION;
  progress = newProgress;
  updateProgressUI();
}

// ---------------- Playlist Actions ----------------
async function selectSong(title) {
  await fetch('/select_song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  fetchSongs({ reset: true });
}

async function deleteSong(title) {
  await fetch('/delete_song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  fetchSongs({ reset: true });
}

async function addSong(title, artist) {
  await fetch('/add_song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, artist })
  });
  fetchSongs();
}

// ---------------- Button Events ----------------
document.getElementById('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const artist = document.getElementById('artist').value;
  addSong(title, artist);
  e.target.reset();
});

document.getElementById('playPauseBtn').addEventListener('click', async () => {
  await fetch('/playpause', { method: 'POST' });
  fetchSongs();
});

document.getElementById('nextBtn').addEventListener('click', async () => {
  await fetch('/next', { method: 'POST' });
  fetchSongs({ reset: true });
});

document.getElementById('prevBtn').addEventListener('click', async () => {
  await fetch('/prev', { method: 'POST' });
  fetchSongs({ reset: true });
});

document.getElementById('loopBtn').addEventListener('click', async () => {
  const res = await fetch('/toggle_loop', { method: 'POST' });
  const data = await res.json();
  LOOP_CURRENT = data.looping;
  fetchSongs();
});

// 🔀 Shuffle button
document.getElementById('shuffleBtn').addEventListener('click', async () => {
  await fetch('/shuffle', { method: 'POST' });
  fetchSongs({ reset: true });
});

// ---------------- Initialize ----------------
fetchSongs();
