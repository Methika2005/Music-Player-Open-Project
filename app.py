from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

FIXED_DURATION = 30

# ---------------- Song Node ----------------
class Song:
    def __init__(self, title, artist="Unknown", duration=FIXED_DURATION):
        self.title = title
        self.artist = artist
        self.duration = duration
        self.next = None
        self.prev = None

# ---------------- Playlist ----------------
class Playlist:
    def __init__(self):
        self.head = self.tail = self.current = None
        self.is_playing = False
        self.loop_current = False

    def add_song(self, title, artist="Unknown", duration=FIXED_DURATION):
        new_song = Song(title, artist, duration)
        if not self.head:
            self.head = self.tail = self.current = new_song
        else:
            self.tail.next = new_song
            new_song.prev = self.tail
            self.tail = new_song

    def delete_song(self, title):
        temp = self.head
        while temp:
            if temp.title == title:
                if temp.prev:
                    temp.prev.next = temp.next
                else:
                    self.head = temp.next
                if temp.next:
                    temp.next.prev = temp.prev
                else:
                    self.tail = temp.prev
                if temp == self.current:
                    self.current = temp.next or temp.prev
                return True
            temp = temp.next
        return False

    def next_song(self):
        if self.loop_current:
            return self.current
        if self.current and self.current.next:
            self.current = self.current.next
        else:
            self.current = self.head
        return self.current

    def prev_song(self):
        if self.loop_current:
            return self.current
        if self.current and self.current.prev:
            self.current = self.current.prev
        else:
            self.current = self.tail
        return self.current

    def select_song(self, title):
        temp = self.head
        while temp:
            if temp.title == title:
                self.current = temp
                return temp
            temp = temp.next
        return None

    def toggle_loop(self):
        self.loop_current = not self.loop_current
        return self.loop_current

    def shuffle(self):
        nodes = []
        temp = self.head
        while temp:
            nodes.append(temp)
            temp = temp.next
        if len(nodes) <= 1:
            return
        random.shuffle(nodes)
        for i in range(len(nodes)):
            nodes[i].prev = nodes[i - 1] if i > 0 else None
            nodes[i].next = nodes[i + 1] if i < len(nodes) - 1 else None
        self.head, self.tail = nodes[0], nodes[-1]
        self.current = self.head


playlist = Playlist()

# ---------------- Genre Song Data ----------------
genre_songs = {
    "Pop": [
        ("Someone Like You", "Adele"),
        ("Blinding Lights", "The Weeknd"),
        ("Perfect", "Ed Sheeran"),
        ("Shape of You", "Ed Sheeran"),
        ("Levitating", "Dua Lipa")
    ],
    "Rock": [
        ("Believer", "Imagine Dragons"),
        ("Numb", "Linkin Park"),
        ("Smells Like Teen Spirit", "Nirvana"),
        ("Hotel California", "Eagles"),
        ("In The End", "Linkin Park")
    ],
    "Indie": [
        ("Let Her Go", "Passenger"),
        ("Youth", "Daughter"),
        ("Dog Days Are Over", "Florence + The Machine"),
        ("Electric Feel", "MGMT"),
        ("Little Talks", "Of Monsters and Men")
    ],
    "Classics": [
        ("Bohemian Rhapsody", "Queen"),
        ("Imagine", "John Lennon"),
        ("Hey Jude", "The Beatles"),
        ("Hallelujah", "Leonard Cohen"),
        ("Sweet Caroline", "Neil Diamond")
    ],
        "Bollywood": [
        ("Tum Hi Ho", "Arijit Singh"),
        ("Kabira", "Tochi Raina, Rekha Bhardwaj"),
        ("Channa Mereya", "Arijit Singh"),
        ("Apna Bana Le", "Arijit Singh"),
        ("Kun Faya Kun", "A.R. Rahman"),
        ("Kalank Title Track", "Arijit Singh"),
        ("Tera Ban Jaunga", "Akhil Sachdeva, Tulsi Kumar"),
        ("Raanjhanaa Title Song", "Jaswinder Singh, Shiraz Uppal"),
        ("Kesariya", "Arijit Singh"),
        ("Ae Dil Hai Mushkil", "Arijit Singh")
    ]    
}

# Initialize with some mixed songs
for genre_list in genre_songs.values():
    for title, artist in random.sample(genre_list, 2):
        playlist.add_song(title, artist)


# ---------------- ROUTES ----------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_songs')
def get_songs():
    songs = []
    temp = playlist.head
    while temp:
        songs.append({"title": temp.title, "artist": temp.artist})
        temp = temp.next
    current = {
        "title": playlist.current.title if playlist.current else "None",
        "artist": playlist.current.artist if playlist.current else "Unknown",
        "is_playing": playlist.is_playing,
        "duration": playlist.current.duration if playlist.current else FIXED_DURATION,
        "loop_current": playlist.loop_current
    }
    return jsonify({
        "songs": songs,
        "current": current,
        "genres": list(genre_songs.keys())
    })

@app.route('/get_songs_by_genre/<genre>')
def get_songs_by_genre(genre):
    if genre not in genre_songs:
        return jsonify([])
    songs = [{"title": t, "artist": a} for t, a in genre_songs[genre]]
    return jsonify(songs)

@app.route('/add_song', methods=['POST'])
def add_song():
    data = request.get_json()
    genre = data.get('genre')
    selected_title = data.get('title')

    if genre not in genre_songs:
        return jsonify({"error": "Invalid genre"}), 400

    if selected_title:
        for title, artist in genre_songs[genre]:
            if title == selected_title:
                playlist.add_song(title, artist)
                return jsonify({"message": f"Added '{title}' from {genre}!"})
        return jsonify({"error": "Song not found in genre"}), 404

    # Add random song
    title, artist = random.choice(genre_songs[genre])
    playlist.add_song(title, artist)
    return jsonify({"message": f"Added random '{title}' from {genre}!"})

@app.route('/delete_song', methods=['POST'])
def delete_song():
    data = request.get_json()
    playlist.delete_song(data['title'])
    return jsonify({"message": "Song deleted!"})

@app.route('/select_song', methods=['POST'])
def select_song():
    data = request.get_json()
    song = playlist.select_song(data['title'])
    if song:
        playlist.is_playing = True
        return jsonify({"title": song.title, "artist": song.artist})
    return jsonify({"error": "Song not found"}), 404

@app.route('/playpause', methods=['POST'])
def playpause():
    playlist.is_playing = not playlist.is_playing
    return jsonify({"is_playing": playlist.is_playing})

@app.route('/next', methods=['POST'])
def next_song():
    song = playlist.next_song()
    return jsonify({"title": song.title, "artist": song.artist})

@app.route('/prev', methods=['POST'])
def prev_song():
    song = playlist.prev_song()
    return jsonify({"title": song.title, "artist": song.artist})

@app.route('/toggle_loop', methods=['POST'])
def toggle_loop():
    state = playlist.toggle_loop()
    return jsonify({"looping": state})

@app.route('/shuffle', methods=['POST'])
def shuffle_songs():
    playlist.shuffle()
    return jsonify({"message": "Playlist shuffled!"})

if __name__ == '__main__':
    app.run(debug=True)
