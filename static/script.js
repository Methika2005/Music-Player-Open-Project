async function fetchSongs() {
  const res = await fetch('/get_songs');
  const data = await res.json();

  const songList = document.getElementById('songList');
  const currentSong = document.getElementById('currentSong');
  const playPauseBtn = document.getElementById('playPauseBtn');

  songList.innerHTML = '';
  data.songs.forEach(song => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${song.title} — ${song.artist}</span>
      <div class="buttons">
        <button onclick="selectSong('${song.title}')">▶️ Play</button>
        <button class="delete" onclick="deleteSong('${song.title}')">🗑️</button>
      </div>
    `;
    songList.appendChild(li);
  });

  currentSong.innerHTML = `${data.current.title} — <span>${data.current.artist}</span>`;
  playPauseBtn.textContent = data.current.is_playing ? '⏸️ Pause' : '▶️ Play';
}

async function selectSong(title) {
  await fetch('/select_song', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ title })
  });
  fetchSongs();
}

async function deleteSong(title) {
  await fetch('/delete_song', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ title })
  });
  fetchSongs();
}

async function addSong(title, artist) {
  await fetch('/add_song', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
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
  await fetch('/playpause', { method: 'POST' });
  fetchSongs();
});

document.getElementById('nextBtn').addEventListener('click', async () => {
  await fetch('/next', { method: 'POST' });
  fetchSongs();
});

document.getElementById('prevBtn').addEventListener('click', async () => {
  await fetch('/prev', { method: 'POST' });
  fetchSongs();
});

// Load on page start
fetchSongs();
