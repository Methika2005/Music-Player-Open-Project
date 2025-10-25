## Music-Player-Open-Project

# 🎵 Playlist Manager Web App

A **web-based playlist manager** built with **Flask, JavaScript, and HTML/CSS**, allowing users to manage songs, play/pause, loop, shuffle, and reorder their playlist using **drag-and-drop**. The app also supports adding songs by **genre**, including **Pop, Rock, Indie, Classics, and Bollywood**.

---

## 🛠 Features

* **View Playlist**: See all songs currently in the playlist.
* **Add Songs**:

  * Choose a genre and select a specific song.
  * Or add a random song from the selected genre.
* **Delete Songs**: Remove any song from the playlist.
* **Playback Controls**:

  * Play/Pause
  * Next / Previous
  * Loop current song
  * Shuffle playlist
* **Drag-and-Drop Reordering**: Rearrange the playlist manually, and the order persists for playback.
* **Automatic Progress Bar**: Smooth progress animation for the currently playing song.
* **Responsive Design**: Works on both desktop and mobile.

---

## 🎶 Supported Genres

* Pop
* Rock
* Indie
* Classics
* Bollywood

---

## 💡 DSA Concepts Used

| Feature                 | Data Structure / Concept                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playlist storage        | **Circular Doubly Linked List** (CDLL) – Each song is a node with `prev` and `next` pointers. Allows O(1) navigation in both directions and circular looping. |
| Adding / Deleting songs | CDLL insertion and deletion at head, tail, or middle.                                                                                                         |
| Next / Previous song    | Navigate the CDLL nodes forward or backward.                                                                                                                  |
| Shuffle                 | Convert CDLL nodes to an array, apply `random.shuffle()`, then rebuild CDLL.                                                                                  |
| Drag-and-Drop Reorder   | On drop, rearrange the `prev` and `next` pointers of CDLL nodes to reflect new order.                                                                         |

---

## 🖼 Diagram: Circular Doubly Linked List

```
       +---------+       +---------+       +---------+
       | Song 1  |<----->| Song 2  |<----->| Song 3  |
       +---------+       +---------+       +---------+
            ^                                |
            |                                v
            +--------------------------------+
           (tail.next points to head, making it circular)

```

* Each node (song) contains:

  * `title`
  * `artist`
  * `duration`
  * `prev` pointer
  * `next` pointer
* The **current song** pointer tracks which song is playing.
* Looping is handled using the CDLL's circular property.

---

## 🖥 Installation & Running

1. **Clone the repository**:

```bash
git clone <repo-url>
cd playlist-manager
```

2. **Create virtual environment & install Flask**:

```bash
python -m venv venv
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate         # Windows

pip install Flask
```

3. **Run the Flask server**:

```bash
python app.py
```

4. **Open in browser**:

```
http://127.0.0.1:5000
```

---

## Screenshots
<img width="1078" height="874" alt="image" src="https://github.com/user-attachments/assets/72c84c31-57df-4f90-8212-c1550ce64737" />
<img width="1084" height="664" alt="image" src="https://github.com/user-attachments/assets/84877360-23b5-4c07-9f67-7b471732a5d1" />


## ⚙️ Notes

* Playlist order persists when using next/previous, shuffle, or manual reordering.
* Drag-and-drop reordering updates the linked list in memory.
* Circular doubly linked list ensures smooth looping and easy navigation.
* The app currently uses **dummy song data**; can be extended to real audio playback with HTML `<audio>` elements.


