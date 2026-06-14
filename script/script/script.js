ru"; 
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
        modeLiveBtn.classList.add('active');
        modeArchiveBtn.classList.remove('active');
        statusTitle.textContent = "Радио Петербург (LIVE)";
    } else {
        modeLiveBtn.classList.remove('active');
        modeArchiveBtn.classList.add('active');
        statusTitle.textContent = "Играет Архив Эфира";
    }

    // Подгружаем нужный звук
    audio.src = isLive ? LIVE_STREAM_URL : ARCHIVE_FILE_URL;
    audio.load();

    // Если плеер уже пел — продолжаем петь новый источник сразу
    if (wasPlaying) {
        audio.play().catch(err => console.log("Браузер заблокировал автостарт:", err));
        playBtn.textContent = '⏸ ПАУЗА';
    } else {
        playBtn.textContent = '▶ ИГРАТЬ';
    }
}

// 3. Ручное управление кнопками режимов (Работает ВСЕГДА независимо от времени)
modeLiveBtn.addEventListener('click', () => {
    userControlled = true; // Отключаем автоматику по времени, так как пользователь нажал сам
    if (!isLive) switchMode(true);
});

modeArchiveBtn.addEventListener('click', () => {
    userControlled = true; // Отключаем автоматику
    if (isLive) switchMode(false);
});

// Кнопка Играть / Пауза
playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = '⏸ ПАУЗА';
    } else {
        audio.pause();
        playBtn.textContent = '▶ ИГРАТЬ';
    }
});

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
    currentTimeEl.textContent = formatTime(audio.currentTime);
    if (audio.duration && audio.duration !== Infinity) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    } else {
        progressBar.style.width = "100%"; // Для LIVE полоса всегда полная
    }
});

audio.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = (audio.duration === Infinity) ? "LIVE" : formatTime(audio.duration);
});

// Клик по полосе для перемотки (работает только в Архиве)
progressContainer.addEventListener('click', (e) => {
    if (!isLive && audio.duration) {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        audio.currentTime = (clickX / width) * audio.duration;
    }
});

// Автопереключение на архив, если днем упал поток радио
audio.addEventListener('error', () => { if (isLive && !userControlled) switchMode(false); });
