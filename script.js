let musicData = {};
let currentArtist = "";
let currentSongIndex = -1;
let activeQueue = [];

const audioPlayer = document.getElementById('audio-player');
const mainContent = document.getElementById('main-content');
const artistListEl = document.getElementById('artist-list');
const playPauseBtn = document.getElementById('play-pause-icon');
const fsPlayBtn = document.getElementById('fs-play-btn');
const progressFill = document.getElementById('progress-fill');
const fsProgressFill = document.getElementById('fs-progress-fill');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const fsCurrentTimeEl = document.getElementById('fs-current-time');
const fsTotalDurationEl = document.getElementById('fs-total-duration');

fetch('songs.json')
    .then(res => res.json())
    .then(data => {
        musicData = data;
        renderSidebarArtists();
        showHome();
    })
    .catch(err => console.error('Chyba načítání songs.json:', err));

function renderSidebarArtists() {
    artistListEl.innerHTML = '';
    Object.keys(musicData).forEach(artist => {
        const btn = document.createElement('button');
        btn.className = 'artist-btn';
        const thumbPath = `songs/${artist}/cover.png`;
        btn.innerHTML = `
            <img src="${thumbPath}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';">
            <span>${artist}</span>
        `;
        btn.onclick = () => selectArtist(artist);
        artistListEl.appendChild(btn);
    });
}

function showHome() {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-home').classList.add('active');

    let gridHTML = '<h1 style="font-size:32px;font-weight:800;margin-bottom:20px;">Dobrý den</h1><div class="home-grid">';
    
    Object.keys(musicData).forEach(artist => {
        const coverPath = `songs/${artist}/cover.png`;
        gridHTML += `
            <div class="artist-card" onclick="selectArtist('${artist}')">
                <img src="${coverPath}" class="artist-card-img" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\'artist-card-img\'>🎵</div>';">
                <div class="artist-card-name">${artist}</div>
            </div>
        `;
    });

    gridHTML += '</div>';
    mainContent.innerHTML = gridHTML;
}

function selectArtist(artist) {
    currentArtist = artist;
    const songs = musicData[artist] || [];

    let html = `
        <div class="header-section">
            <div class="artist-avatar">
                <img src="songs/${artist}/cover.png" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='🎵';">
            </div>
            <div>
                <span style="font-size:12px;font-weight:700;text-transform:uppercase;">Interpret</span>
                <h1 class="header-title">${artist}</h1>
            </div>
        </div>
        <div class="song-list">
    `;

    songs.forEach((song, index) => {
        const cleanName = song.replace(/\.[^/.]+$/, "");
        html += `
            <div class="song-item" onclick="playSongFromQueue('${artist}', ${index})">
                <div class="song-info-left">
                    <span class="song-index">${index + 1}</span>
                    <div class="song-name">${cleanName}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    mainContent.innerHTML = html;
}

function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) { showHome(); return; }

    let html = `<h2 style="margin-bottom:15px;">Výsledky pro: "${query}"</h2><div class="song-list">`;
    let found = false;

    Object.keys(musicData).forEach(artist => {
        musicData[artist].forEach((song, index) => {
            const cleanName = song.replace(/\.[^/.]+$/, "");
            if (cleanName.toLowerCase().includes(query) || artist.toLowerCase().includes(query)) {
                found = true;
                html += `
                    <div class="song-item" onclick="playSongFromQueue('${artist}', ${index})">
                        <div class="song-info-left">
                            <span class="song-index">🎵</span>
                            <div>
                                <div class="song-name">${cleanName}</div>
                                <div style="font-size:12px;color:var(--text-sub);">${artist}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    });

    if (!found) html += '<div style="color:var(--text-sub);">Nic nenalezeno</div>';
    html += '</div>';
    mainContent.innerHTML = html;
}

function playSongFromQueue(artist, index) {
    currentArtist = artist;
    currentSongIndex = index;
    activeQueue = musicData[artist];
    playSong();
}

function playSong() {
    if (!activeQueue || !activeQueue[currentSongIndex]) return;

    const songFile = activeQueue[currentSongIndex];
    const songPath = `songs/${currentArtist}/${songFile}`;
    const cleanName = songFile.replace(/\.[^/.]+$/, "");
    const coverPath = `songs/${currentArtist}/cover.png`;

    audioPlayer.src = songPath;
    audioPlayer.play().catch(e => console.log("Autoplay blocked:", e));

    playPauseBtn.textContent = "⏸";
    fsPlayBtn.textContent = "⏸";

    document.getElementById('now-playing-title').textContent = cleanName;
    document.getElementById('now-playing-artist').textContent = currentArtist;
    document.getElementById('fs-title').textContent = cleanName;
    document.getElementById('fs-artist').textContent = currentArtist;

    const imgHTML = `<img src="${coverPath}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='🎵';">`;
    document.getElementById('np-cover-container').innerHTML = imgHTML;
    document.getElementById('fs-cover').innerHTML = imgHTML;
}

function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.textContent = "⏸";
        fsPlayBtn.textContent = "⏸";
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = "▶";
        fsPlayBtn.textContent = "▶";
    }
}

function nextSong() {
    if (!activeQueue.length) return;
    currentSongIndex = (currentSongIndex + 1) % activeQueue.length;
    playSong();
}

function prevSong() {
    if (!activeQueue.length) return;
    currentSongIndex = (currentSongIndex - 1 + activeQueue.length) % activeQueue.length;
    playSong();
}

audioPlayer.ontimeupdate = () => {
    if (audioPlayer.duration) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${percent}%`;
        fsProgressFill.style.width = `${percent}%`;
        
        const timeStr = formatTime(audioPlayer.currentTime);
        const durStr = formatTime(audioPlayer.duration);

        currentTimeEl.textContent = timeStr;
        totalDurationEl.textContent = durStr;
        fsCurrentTimeEl.textContent = timeStr;
        fsTotalDurationEl.textContent = durStr;
    }
};

function seekSong(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    if (audioPlayer.duration) {
        audioPlayer.currentTime = (clickX / rect.width) * audioPlayer.duration;
    }
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function openFullscreenPlayer() {
    if (window.innerWidth <= 768) {
        document.getElementById('fs-player').classList.add('active');
    }
}

function closeFullscreenPlayer() {
    document.getElementById('fs-player').classList.remove('active');
}

audioPlayer.onended = nextSong;
