// Настройки ссылок
const LIVE_STREAM_URL = "http://5-tv.ru"; 
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
let userControlled = false; // Флаг: переключил ли пользователь режим вручную

// 1. Автоматическая проверка времени (1:00 - 6:00 -> Архив, иначе -> Прямой эфир)
function checkTimeAutoswitch() {
    if (userControlled) return; // Если пользователь пощелкал кнопки сам — автоматику не трогаем

    const currentHour = new Date().getHours();
    const shouldBeArchive = (currentHour >= 1 && currentHour < 6);

    if (shouldBeArchive && isLive) {
        switchMode(false); // Включаем архив ночью
    } else if (!shouldBeArchive && !isLive) {
        switchMode(true);  // Включаем радио утром
    }
}

// 2. Функция смены режима
function switchMode(wantLive) {
    isLive = wantLive;
    const wasPlaying = !audio.paused;

    // Меняем активный вид кнопок сверху
    if (isLive) {
        if (modeLiveBtn) modeLiveBtn.classList.add('active');
        if (modeArchiveBtn) modeArchiveBtn.classList.remove('active');
        if (statusTitle) statusTitle.textContent = "Радио Петербург (LIVE)";
    } else {
        if (modeLiveBtn) modeLiveBtn.classList.remove('active');
        if (modeArchiveBtn) modeArchiveBtn.classList.add('active');
        if (statusTitle) statusTitle.textContent = "Играет Архив Эфира";
    }

    // Подгружаем нужный звук
    audio.src = isLive ? LIVE_STREAM_URL : ARCHIVE_FILE_URL;
    audio.load();

    // Если плеер уже пел — продолжаем петь новый источник сразу
    if (wasPlaying) {
        audio.play().catch(err => console.log("Браузер заблокировал автостарт:", err));
        if (playBtn) playBtn.textContent = '⏸ ПАУЗА';
    } else {
        if (playBtn) playBtn.textContent = '▶ ИГРАТЬ';
    }
}

// 3. Ручное управление кнопками режимов (Работает ВСЕГДА независимо от времени)
if (modeLiveBtn) {
    modeLiveBtn.addEventListener('click', () => {
        userControlled = true; // Отключаем автоматику по времени
        if (!isLive) switchMode(true);
    });
}

if (modeArchiveBtn) {
    modeArchiveBtn.addEventListener('click', () => {
        userControlled = true; // Отключаем автоматику
        if (isLive) switchMode(false);
    });
}

// Кнопка Играть / Пауза
if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = '⏸ ПАУЗА';
        } else {
            audio.pause();
            playBtn.textContent = '▶ ИГРАТЬ';
        }
    });
}

// Инициализация при заходе на сайт + проверка времени каждую минуту
checkTimeAutoswitch();
setInterval(checkTimeAutoswitch, 60000);

// 4. Форматирование времени и прогресс-бар
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
        if (progressBar) progressBar.style.width = "100%"; // Для LIVE полная полоса
    }
});

audio.addEventListener('loadedmetadata', () => {
    if (durationTimeEl) durationTimeEl.textContent = (audio.duration === Infinity) ? "LIVE" : formatTime(audio.duration);
});

// Клик по полосе для перемотки (работает только в Архиве)
if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
        if (!isLive && audio.duration) {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            audio.currentTime = (clickX / width) * audio.duration;
        }
    });
}

// Автопереключение на архив, если днем упал поток радио
audio.addEventListener('error', () => { if (isLive && !userControlled) switchMode(false); });
