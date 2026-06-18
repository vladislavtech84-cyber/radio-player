const audio = document.getElementById('radio');
const recordBtn = document.getElementById('record-btn');
const btnText = document.getElementById('text');
const btnDot = document.getElementById('dot');

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioContext;
let source;
let streamDest;

async function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(audio);
        streamDest = audioContext.createMediaStreamDestination();
        source.connect(streamDest);
        source.connect(audioContext.destination);
    }
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

recordBtn.addEventListener('click', async () => {
    let savedToken = localStorage.getItem('my_github_token');
    if (!savedToken) {
        savedToken = prompt('Пожалуйста, введите ваш токен GitHub (начинается на ghp_ или github_pat_):');
        if (!savedToken) {
            alert('Без правильного токена запись не сможет сохраниться!');
            return;
        }
        localStorage.setItem('my_github_token', savedToken.trim());
    }

    if (audio.paused) {
        alert('Сначала включите радио кнопкой Play на плеере!');
        return;
    }

    if (!isRecording) {
        try {
            audioChunks = [];
            await initAudio();

            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/aac';
            mediaRecorder = new MediaRecorder(streamDest.stream, { mimeType });
            
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                btnText.textContent = 'Сохранение на GitHub...';
                btnDot.textContent = '⏳';

                const audioBlob = new Blob(audioChunks, { type: mimeType });
                const ext = mimeType.includes('webm') ? 'webm' : 'aac';
                
                const now = new Date();
                const dateStr = now.getFullYear() + '-' + 
                                String(now.getMonth()+1).padStart(2,'0') + '-' + 
                                String(now.getDate()).padStart(2,'0') + '_' + 
                                String(now.getHours()).padStart(2,'0') + '-' + 
                                String(now.getMinutes()).padStart(2,'0') + '-' + 
                                String(now.getSeconds()).padStart(2,'0');
                                
                const fileName = 'radio_record-' + dateStr + '.' + ext;

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Data = reader.result.split(',')[1]; 
                    
                    const url = 'https://github.com' + fileName;
                    
                    try {
                        const response = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                'Authorization': 'Bearer ' + savedToken,
                                'Accept': 'application/vnd.github+json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: 'Запись радио эфира: ' + fileName,
                                content: base64Data
                            })
                        });

                        if (response.ok) {
                            alert('Успешно сохранен в папку: records/' + fileName);
                        } else {
                            const errData = await response.json();
                            console.error('Ошибка API:', errData);
                            if (response.status === 401 || response.status === 403) {
                                alert('Ошибка токена! Мы сбросили старый ключ. Нажмите кнопку записи еще раз и введите НОВЫЙ рабочий токен.');
                                localStorage.removeItem('my_github_token');
                            } else {
                                alert('GitHub отклонил файл. Ошибка: ' + (errData.message || response.status));
                            }
                        }
                    } catch (uploadErr) {
                        console.error('Ошибка сети:', uploadErr);
                        alert('Сетевая ошибка при отправке файла на GitHub.');
                    } finally {
                        btnText.textContent = 'Записать эфир';
                        btnDot.textContent = '🔴';
                    }
                };
            };

            mediaRecorder.start();
            isRecording = true;
            recordBtn.classList.add('recording');
            btnText.textContent = 'Остановить и сохранить';
            btnDot.textContent = '⏹️';
        } catch (err) {
            console.error('Критическая ошибка:', err);
            alert('Не удалось запустить запись.');
        }
    } else {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        isRecording = false;
        recordBtn.classList.remove('recording');
    }
});
ф
