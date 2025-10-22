from flask import Flask, render_template, request, redirect, url_for, jsonify

app = Flask(__name__)

# ------------------- Song Node -------------------
class Song:
    def __init__(self, title, artist="Unknown", duration=3.0):
        self.title = title
        self.artist = artist
        self.duration = duration
        self.next = None
        self.prev = None

# ------------------- Playlist Class -------------------
class Playlist:
    def __init__(self):
        self.head = None
        self.tail = None
        self.current = None
        self.is_playing = False

    def add_song(self, title, artist="Unknown", duration=3.0):
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
        if self.current and self.current.next:
            self.current = self.current.next
        return self.current

    def prev_song(self):
        if self.current and self.current.prev:
            self.current = self.current.prev
        return self.current

    def select_song(self, title):
        temp = self.head
        while temp:
            if temp.title == title:
                self.current = temp
                return temp
            temp = temp.next
        return None

playlist = Playlist()

# Dummy data
demo_songs = [
    ("Someone Like You", "Adele"),
    ("Blinding Lights", "The Weeknd"),
    ("Perfect", "Ed Sheeran"),
    ("Believer", "Imagine Dragons"),
    ("Shape of You", "Ed Sheeran"),
    ("Rolling in the Deep", "Adele"),
    ("Counting Stars", "OneRepublic"),
    ("Let Her Go", "Passenger"),
    ("Hymn for the Weekend", "Coldplay"),
    ("Cheap Thrills", "Sia")
]
for title, artist in demo_songs:
    playlist.add_song(title, artist)

# ------------------- ROUTES -------------------
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
        "is_playing": playlist.is_playing
    }
    return jsonify({"songs": songs, "current": current})

@app.route('/add_song', methods=['POST'])
def add_song():
    data = request.get_json()
    playlist.add_song(data['title'], data.get('artist', 'Unknown'))
    return jsonify({"message": "Song added!"})

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
        return jsonify({"title": song.title, "artist": song.artist})
    return jsonify({"error": "Song not found"}), 404

@app.route('/playpause', methods=['POST'])
def playpause():
    playlist.is_playing = not playlist.is_playing
    return jsonify({"is_playing": playlist.is_playing})

@app.route('/next', methods=['POST'])
def next_song():
    song = playlist.next_song()
    if song:
        return jsonify({"title": song.title, "artist": song.artist})
    return jsonify({"error": "No next song"}), 404

@app.route('/prev', methods=['POST'])
def prev_song():
    song = playlist.prev_song()
    if song:
        return jsonify({"title": song.title, "artist": song.artist})
    return jsonify({"error": "No previous song"}), 404

if __name__ == '__main__':
    app.run(debug=True)
