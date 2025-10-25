let progress = 0;
let progressInterval = null;
let SONG_DURATION = 10;
let LOOP_CURRENT = false;
let currentTitle = null;
let isSeeking = false;

// ---------------- Fetch Songs ----------------
async function fetchSongs({ reset = false } = {}) {
  const res = await fetch('/get_songs');
  const data = await res.json();

  const songList = document.getElementById('songList');
  const currentSong = document.getElementById('currentSong');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const totalTime = document.getElementById('totalTime');
  const loopBtn = document.getElementById('loopBtn');
  const genreSelect = document.getElementById('genreSelect');

  // Clear current list
  songList.innerHTML = '';

  // Populate playlist with drag-and-drop support
  data.songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.setAttribute('draggable', true);
    li.dataset.index = index;
    li.innerHTML = `
      <span>${song.title} — ${song.artist}</span>
      <div class="buttons">
        <button onclick="selectSong('${song.title}')">▶️</button>
        <button class="delete" onclick="deleteSong('${song.title}')">🗑️</button>
      </div>
    `;
    songList.appendChild(li);
  });

  // Drag and Drop handlers
  addDragAndDrop(songList);

  currentSong.innerHTML = `${data.current.title} — <span>${data.current.artist}</span>`;
  playPauseBtn.textContent = data.current.is_playing ? '⏸️ Pause' : '▶️ Play';

  SONG_DURATION = data.current.duration || 10;
  LOOP_CURRENT = data.current.loop_current;
  totalTime.textContent = formatTime(SONG_DURATION);
  loopBtn.style.background = LOOP_CURRENT ? '#FFD700' : 'none';

  // Populate genres if not already
  if (genreSelect.options.length <= 1) {
    data.genres.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      genreSelect.appendChild(opt);
    });
  }
}

// ---------------- Time formatting ----------------
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// ---------------- Progress bar ----------------
function updateProgressUI() {
  const bar = document.getElementById('progressBar');
  const knob = document.getElementById('progressKnob');
  const currentTime = document.getElementById('currentTime');
  const pct = SONG_DURATION > 0 ? (progress / SONG_DURATION) * 100 : 0;
  bar.style.width = `${Math.min(100, pct)}%`;
  knob.style.left = `${Math.min(100, pct)}%`;
  currentTime.textContent = formatTime(progress);
}

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

      // Loop same song
      if (stateData.current.loop_current) {
        progress = 0;
        startProgress(true);
      } else {
        // Move to next song and start automatically
        await fetch('/next', { method: 'POST' });
        progress = 0;
        fetchSongs({ reset: true }).then(() => startProgress(true));
      }
    }
  }, 100);
}

// ---------------- Drag Seek ----------------
const timeline = document.getElementById('timeline');
const knob = document.getElementById('progressKnob');
timeline.addEventListener('mousedown', startSeek);
knob.addEventListener('mousedown', startSeek);
window.addEventListener('mousemove', seekMove);
window.addEventListener('mouseup', endSeek);

function startSeek(e) { isSeeking = true; knob.classList.add('dragging'); document.body.style.cursor = "grabbing"; updateSeek(e); }
function seekMove(e) { if (!isSeeking) return; updateSeek(e); }
function endSeek(e) { if (!isSeeking) return; isSeeking = false; knob.classList.remove('dragging'); document.body.style.cursor = "default"; updateSeek(e); }
function updateSeek(e) {
  const rect = timeline.getBoundingClientRect();
  const offsetX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
  progress = (offsetX / rect.width) * SONG_DURATION;
  updateProgressUI();
}

// ---------------- Playlist Actions ----------------
async function selectSong(title) {
  try {
    const res = await fetch('/select_song', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    const data = await res.json();
    if (data.error) return;

    progress = 0;
    document.getElementById('playPauseBtn').textContent = '⏸️ Pause';
    startProgress(true);
    fetchSongs({ reset: true });
  } catch (err) {
    console.error("Error selecting song:", err);
  }
}

async function deleteSong(title) {
  await fetch('/delete_song', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });

  // If deleted song was current, auto-play next
  progress = 0;
  fetchSongs({ reset: true }).then(() => startProgress(true));
}

async function addSongByGenre(genre, title = null) {
  await fetch('/add_song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ genre, title })
  });
  fetchSongs();
  resetDropdowns();
}

// ---------------- Dropdown Interactions ----------------
document.getElementById('genreSelect').addEventListener('change', async e => {
  const genre = e.target.value;
  const songSelect = document.getElementById('songSelect');
  songSelect.disabled = true;
  songSelect.innerHTML = `<option>Loading...</option>`;
  const res = await fetch(`/get_songs_by_genre/${genre}`);
  const songs = await res.json();
  songSelect.innerHTML = `<option value="">Select Song</option>`;
  songs.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.title;
    opt.textContent = `${s.title} — ${s.artist}`;
    songSelect.appendChild(opt);
  });
  songSelect.disabled = false;
});

function resetDropdowns() {
  const genreSelect = document.getElementById('genreSelect');
  const songSelect = document.getElementById('songSelect');
  genreSelect.value = "";
  songSelect.innerHTML = `<option value="">Select Song</option>`;
  songSelect.disabled = true;
}

// ---------------- Buttons ----------------
document.getElementById('addSpecificBtn').addEventListener('click', async () => {
  const genre = document.getElementById('genreSelect').value;
  const song = document.getElementById('songSelect').value;
  if (!genre) return alert("Select a genre first!");
  if (!song) return alert("Select a song to add!");
  addSongByGenre(genre, song);
});

document.getElementById('addRandomBtn').addEventListener('click', async () => {
  const genre = document.getElementById('genreSelect').value;
  if (!genre) return alert("Select a genre first!");
  addSongByGenre(genre);
});

document.getElementById('playPauseBtn').addEventListener('click', async () => {
  const res = await fetch('/playpause', { method: 'POST' });
  const data = await res.json();
  const btn = document.getElementById('playPauseBtn');
  btn.textContent = data.is_playing ? '⏸️ Pause' : '▶️ Play';
  if (data.is_playing) startProgress(false);
  else clearInterval(progressInterval);
});

document.getElementById('nextBtn').addEventListener('click', async () => {
  await fetch('/next', { method: 'POST' });
  progress = 0;
  fetchSongs({ reset: true }).then(() => startProgress(true));
});

document.getElementById('prevBtn').addEventListener('click', async () => {
  await fetch('/prev', { method: 'POST' });
  progress = 0;
  fetchSongs({ reset: true }).then(() => startProgress(true));
});

document.getElementById('loopBtn').addEventListener('click', async () => {
  const res = await fetch('/toggle_loop', { method: 'POST' });
  const data = await res.json();
  LOOP_CURRENT = data.looping;
  fetchSongs();
});

document.getElementById('shuffleBtn').addEventListener('click', async () => {
  await fetch('/shuffle', { method: 'POST' });
  progress = 0;
  fetchSongs({ reset: true }).then(() => startProgress(true));
});

// ---------------- Drag & Drop for Playlist ----------------
function addDragAndDrop(list) {
  let dragged = null;

  list.addEventListener('dragstart', e => {
    dragged = e.target;
    e.target.style.opacity = 0.5;
  });

  list.addEventListener('dragend', e => {
    dragged.style.opacity = "";
    dragged = null;
  });

  list.addEventListener('dragover', e => e.preventDefault());

  list.addEventListener('drop', async e => {
    e.preventDefault();
    if (!dragged) return;

    const target = e.target.closest('li');
    if (!target || target === dragged) return;

    list.insertBefore(dragged, target.nextSibling);

    // Send new order to server
    const newOrder = Array.from(list.children).map(li => li.querySelector('span').textContent.split(' — ')[0]);
    await fetch('/reorder_playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newOrder })
    });
    fetchSongs({ reset: true });
  });
}

// ---------------- Init ----------------
fetchSongs();
