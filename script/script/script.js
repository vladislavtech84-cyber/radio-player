// Настройки ссылок
const LIVE_STREAM_URL = "https://cdnvideo.ru"; 
const ARCHIVE_FILE_URL = "https://google.com"; 

const audio = document.getElementById('audioTrack');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const statusTitle = document.getElementById('statusTitle');

const modeLiveBtn = document.getElementById('modeLive');
const modeArchiveBtn = document.getElementById('modeArchive');

let isLive = true; 
let userControlled = false;

function checkTimeAutoswitch() {
    if (userControlled) return;
    const currentHour = new Date().getHours();
    const shouldBeArchive = (currentHour >= 1 && currentHour < 6);
    if (shouldBeArchive && isLive) {
        switchMode(false);
    } else if (!shouldBeArchive && !isLive) {
        switchMode(true);
    }
}

function switchMode(wantLive) {
    isLive = wantLive;
    const wasPlaying = !audio.paused;

    if (isLive) {
        if (modeLiveBtn) modeLiveBtn.classList.add('active');
        if (modeArchiveBtn) modeArchiveBtn.classList.remove('active');
        if (statusTitle) statusTitle.textContent = "Радио Петербург (LIVE)";
    } else {
        if (modeLiveBtn) modeLiveBtn.classList.remove('active');
        if (modeArchiveBtn) modeArchiveBtn.classList.add('active');
        if (statusTitle) statusTitle.textContent = "Играет Архив Эфира";
    }

    audio.src = isLive ? LIVE_STREAM_URL : ARCHIVE_FILE_URL;
    audio.load();

    if (wasPlaying) {
        audio.play().catch(err => console.log(err));
        if (playBtn) playBtn.textContent = '⏸ ПАУЗА';
    } else {
        if (playBtn) playBtn.textContent = '▶ ИГРАТЬ';
    }
}

if (modeLiveBtn) modeLiveBtn.addEventListener('click', () => { userControlled = true; if (!isLive) switchMode(true); });
if (modeArchiveBtn) modeArchiveBtn.addEventListener('click', () => { userControlled = true; if (isLive) switchMode(false); });

if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().catch(err => console.log(err));
            playBtn.textContent = '⏸ ПАУЗА';
        } else {
            audio.pause();
            playBtn.textContent = '▶ ИГРАТЬ';
        }
    });
}

checkTimeAutoswitch();
setInterval(checkTimeAutoswitch, 60000);

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "00:00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

audio.addEventListener('timeupdate', () => {
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    if (audio.duration && audio.duration !== Infinity) {
        if (progressBar) progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    } else {
        if (progressBar) progressBar.style.width = "100%";
    }
});

audio.addEventListener('loadedmetadata', () => {
    if (durationTimeEl) durationTimeEl.textContent = (audio.duration === Infinity) ? "LIVE" : formatTime(audio.duration);
});

if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
        if (!isLive && audio.duration) {
            audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration;
        }
    });
}

audio.addEventListener('error', () => { if (isLive && !userControlled) switchMode(false); });
