let progress = 0;
let progressInterval = null;
let SONG_DURATION = 10;
let LOOP_CURRENT = false;
let currentTitle = null; // keep track of what title we currently have

async function fetchSongs({ reset = false } = {}) {
  // reset param: explicit request to reset progress (e.g., user pressed next/prev or selected song)
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

  // Update duration & loop flag
  SONG_DURATION = data.current.duration || 10;
  LOOP_CURRENT = data.current.loop_current;
  totalTime.textContent = formatTime(SONG_DURATION);

  // update loop button visual
  loopBtn.style.background = LOOP_CURRENT ? '#FFD700' : 'none';

  // Determine whether to reset progress:
  // - If explicit reset param true -> reset
  // - Else if currentTitle is different from data.current.title -> song changed -> reset
  // - Else keep progress as is (i.e., toggling loop shouldn't reset)
  const songChanged = currentTitle !== data.current.title;
  if (songChanged) currentTitle = data.current.title;

  const shouldReset = reset || songChanged;

  if (data.current.is_playing) {
    startProgress(shouldReset);
  } else {
    // paused: keep progress as is (don't reset), but update UI
    clearInterval(progressInterval);
    updateProgressUI();
  }
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function updateProgressUI() {
  // Ensure UI matches current progress value
  const bar = document.getElementById('progressBar');
  const currentTime = document.getElementById('currentTime');
  const pct = SONG_DURATION > 0 ? (progress / SONG_DURATION) * 100 : 0;
  bar.style.width = `${Math.min(100, pct)}%`;
  currentTime.textContent = formatTime(progress);
}

function startProgress(reset = false) {
  clearInterval(progressInterval);
  const bar = document.getElementById('progressBar');
  const currentTimeEl = document.getElementById('currentTime');

  if (reset) {
    progress = 0;
  }
  // Update UI immediately to reflect (if reset then show 0)
  updateProgressUI();

  // Tick every second
  progressInterval = setInterval(async () => {
    // If playing was paused by backend meanwhile, stop
    const resState = await fetch('/get_songs');
    const stateData = await resState.json();
    if (!stateData.current.is_playing) {
      clearInterval(progressInterval);
      return;
    }

    // increment progress
    progress++;

    // update UI
    updateProgressUI();

    if (progress >= SONG_DURATION) {
      clearInterval(progressInterval);
      // Auto-advance (backend will respect loop_current and might return same song)
      await fetch('/next', { method: 'POST' });
      // When advancing due to natural end, we want the next song to start from 0
      // so request fetchSongs with reset=true
      fetchSongs({ reset: true });
      return;
    }
  }, 1000);
}

async function selectSong(title) {
  await fetch('/select_song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  // Selecting a song should restart it
  fetchSongs({ reset: true });
}

async function deleteSong(title) {
  await fetch('/delete_song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  // If current was deleted, backend will change current; fetch and reset to reflect
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

document.getElementById('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const artist = document.getElementById('artist').value;
  addSong(title, artist);
  e.target.reset();
});

document.getElementById('playPauseBtn').addEventListener('click', async () => {
  // toggling play/pause should not reset progress (resume from same point)
  await fetch('/playpause', { method: 'POST' });
  fetchSongs(); // not passing reset -> will not reset unless song changed
});

document.getElementById('nextBtn').addEventListener('click', async () => {
  // user explicitly requested next: reset progress (even if loop_current true and next returns same)
  await fetch('/next', { method: 'POST' });
  fetchSongs({ reset: true });
});

document.getElementById('prevBtn').addEventListener('click', async () => {
  // user explicitly requested prev: reset progress
  await fetch('/prev', { method: 'POST' });
  fetchSongs({ reset: true });
});

document.getElementById('loopBtn').addEventListener('click', async () => {
  // toggling loop should NOT reset progress or restart song
  const res = await fetch('/toggle_loop', { method: 'POST' });
  const data = await res.json();
  LOOP_CURRENT = data.looping;
  // Just refresh UI without resetting progress
  fetchSongs(); // no reset
});

// Load on start
fetchSongs();
