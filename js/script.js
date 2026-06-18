let mediaRecorder;
let audioChunks = [];

// 1. ФУНКЦИЯ СТАРТА ЗАПИСИ (вызывать по нажатию на кнопку "Запись")
async function startRecording() {
    audioChunks = []; // Очищаем старые данные
    try {
        // Запрашиваем доступ к аудио устройства
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        // Собираем кусочки аудиопотока в процессе записи
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        // Логика, которая сработает СРАЗУ после остановки записи
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            sendToGitHub(audioBlob); // Передаем готовый файл в функцию отправки
        };

        mediaRecorder.start();
        console.log("Запись аудио потока началась...");
    } catch (error) {
        console.error("Не удалось получить доступ к микрофону:", error);
        alert("Запрещен доступ к микрофону или звуку.");
    }
}

// 2. ФУНКЦИЯ ОСТАНОВКИ ЗАПИСИ (вызывать по нажатию на кнопку "Стоп")
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log("Запись остановлена. Начинается отправка...");
    }
}

// 3. ФУНКЦИЯ ОТПРАВКИ НА GITHUB (тот самый код, адаптированный под цепочку)
function sendToGitHub(audioBlob) {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob); // Переводим аудио в формат для чтения

    reader.onloadend = function () {
        // Получаем чистую строку Base64
        const base64Content = reader.result.split(',')[1];

        const GITHUB_TOKEN = "ВАШ_ТОКЕН_СЮДА"; // Укажите ваш рабочий токен
        const fileName = `radio_record_${Date.now()}.webm`; 
        const url = `https://github.com{fileName}`;

        fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.v3+json"
            },
            body: JSON.stringify({
                message: `Запись радио-эфира: ${fileName}`,
                content: base64Content // GitHub сохранит это как настоящий аудиофайл
            })
        })
        .then(response => {
            if (response.ok) {
                alert("Аудиозапись успешно отправлена и сохранена на GitHub!");
            } else {
                return response.json().then(err => { throw new Error(err.message); });
            }
        })
        .catch(error => {
            console.error("Ошибка при отправке:", error);
            alert(`Ошибка сохранения: ${error.message}`);
        });
    };
}
