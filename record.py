import datetime
import time
import requests
import signal
import sys

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"
is_running = True
file_name = ""

# Обработчик сигнала принудительной остановки от GitHub
def handle_stop_signal(signum, frame):
    global is_running
    print("\n[!] Получен сигнал остановки. Завершаем запись и сохраняем файл...")
    is_running = False

# Регистрируем перехват сигналов завершения (SIGTERM)
signal.signal(signal.SIGTERM, handle_stop_signal)
signal.signal(signal.SIGINT, handle_stop_signal)

def get_recording_duration():
    now = datetime.datetime.now()
    target_time = now.replace(hour=18, minute=0, second=0, microsecond=0)
    if now >= target_time:
        target_time += datetime.timedelta(days=1)
    return int((target_time - now).total_seconds())

def record_stream(duration, filename):
    global is_running
    print(f"Запись радио начата. Плановое время: {duration} сек. до 18:00.")
    start_time = time.time()
    
    try:
        response = requests.get(STREAM_URL, stream=True, timeout=15)
        response.raise_for_status()
        
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=4096):
                # Проверяем штатный таймер И нажатие кнопки "Остановить"
                if not is_running or (time.time() - start_time > duration):
                    break
                if chunk:
                    f.write(chunk)
                    
        print(f"Запись успешно сохранена: {filename}")
    except Exception as e:
        print(f"Ошибка при записи: {e}")

if __name__ == "__main__":
    seconds_to_record = get_recording_duration()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"radio_record_{timestamp}.mp3"
    
    record_stream(seconds_to_record, file_name)
