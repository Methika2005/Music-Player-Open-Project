
# 🎵 Playlist Manager Web App

A **web-based playlist manager** built using **Flask (Python)**, **HTML**, **CSS**, and **JavaScript**, that allows users to **add, play, pause, loop, delete, shuffle, and navigate songs** through an interactive interface.  

It also supports adding songs from multiple genres like **Pop**, **Rock**, **Indie**, **Classics**, and **Bollywood** — showcasing the practical implementation of **Data Structures and Algorithms (DSA)** in a real-world project.

---

## ✨ Features

✅ **View Playlist** – Display all songs currently in your playlist.  
✅ **Add Songs** – Choose a genre and:  
   - Add a **specific song**, or  
   - Add a **random song** from that genre.  
✅ **Delete Songs** – Remove songs from the playlist. If the playing song is deleted, the next one automatically plays.  
✅ **Playback Controls** –  
   🎧 Play / Pause  
   ⏭️ Next / Previous  
   🔁 Loop Current Song  
   🔀 Shuffle Playlist  
✅ **Circular Playlist Navigation** – After the last song, playback automatically loops back to the first.  
✅ **Smooth Progress Bar** – Real-time progress tracking with draggable seek functionality.  

---

## 💡 DSA Concepts Used

| 🎯 Feature | 🧠 Data Structure / Algorithm Used |
|------------|----------------------------------|
| Playlist Storage | **Circular Doubly Linked List (CDLL)** — each song is a node with `prev` and `next` pointers. Enables O(1) traversal in both directions and looping functionality. |
| Add / Delete Songs | Node insertion and deletion while maintaining CDLL integrity and circular references. |
| Next / Previous | Moves the `current` pointer to the next or previous node. Automatically wraps due to CDLL structure. |
| Shuffle | Converts the CDLL into a Python list, applies the **Fisher–Yates Shuffle**, and rebuilds the circular structure. |
| Looping | Replays the current node without altering traversal order. |

---

## 🖼️ Data Structure Visualization

### 🎵 Circular Doubly Linked List


     +---------+       +---------+       +---------+
     | Song 1  |<----->| Song 2  |<----->| Song 3  |
     +---------+       +---------+       +---------+
          ^                                  |
          |                                  v
     <----+----------------------------------+
      (tail.next = head, head.prev = tail)



🔁 This structure ensures:
- Constant-time navigation in both directions.  
- Seamless looping from the last song to the first.  
- Easy insertion and deletion without disrupting playback order.

---
##⚙️ Technologies Used

🐍 Flask (Python) — Backend logic and CDLL data structure

💻 HTML, CSS, JavaScript — Frontend interface and interactivity

🔁 Circular Doubly Linked List (CDLL) — Core DSA powering playlist traversal

🎲 Fisher–Yates Shuffle Algorithm — For randomizing playlist order

---

## 🧩 Folder Structure

```

playlist-manager/
├── app.py              # Flask backend with CDLL logic
├── templates/
│   └── index.html      # Frontend structure
├── static/
│   ├── style.css       # Styling and layout
│   └── script.js       # Client-side logic
└── README.md           # Documentation

````

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone <repo-url>
cd playlist-manager
````

### 2️⃣ Install Flask

```bash
pip install flask
```

### 3️⃣ Run the Application

```bash
python app.py
```

### 4️⃣ Open in Browser

```
http://127.0.0.1:5000/
```

---

## 🧠 DSA Learning Outcomes

📘 Understanding and implementing a **Circular Doubly Linked List (CDLL)**.
🔁 Applying **node-based operations**: insertion, deletion, and traversal.
🎲 Using the **Fisher–Yates Shuffle algorithm** to randomize song order.
🧩 Managing **pointer updates and circular references**.
🕹️ Integrating backend DSA logic with a real-world, interactive UI.


## Screenshots
<img width="1125" height="869" alt="image" src="https://github.com/user-attachments/assets/ac27fc13-433e-4880-8643-ff600346555a" />

<img width="1112" height="893" alt="image" src="https://github.com/user-attachments/assets/40bb0fe4-819c-4a8e-b7eb-60867d40ba65" />


---

## 🪄 Notes

* The playlist structure is **circular**, ensuring smooth looping and navigation.
* The **shuffle** feature randomizes the node order dynamically.
* When a song finishes or is deleted, playback automatically moves to the next available node.
* Currently uses **mock song data** — can be extended to real audio integration using HTML `<audio>` elements.

---

## 💬 Future Enhancements

* 🎧 Integrate real audio playback.
* 💾 Add persistent playlist storage (e.g., SQLite or MongoDB).
* 🧭 Include search and filter options.
* 📱 Make UI fully responsive for mobile devices.

---

## 🏁 Conclusion

This project bridges the gap between **theory and implementation** by demonstrating how core **DSA concepts like linked lists and algorithms** can power a fully functional, interactive web application.

---
**✨ *Developed with logic, loops, and a love for music!* 🎶**


