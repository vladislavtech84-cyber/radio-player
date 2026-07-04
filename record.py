import datetime
import time
import requests

# Прямая ссылка на ваше радио
STREAM_URL = "https://radio.5-tv.ru/radio.mp3"

def get_recording_duration():
    now = datetime.datetime.now()
    # Задаем целевое время — 18:00 текущего дня
    target_time = now.replace(hour=18, minute=0, second=0, microsecond=0)
    
    # Если скрипт запущен после 18:00, запись пойдет до 18:00 следующего дня
    if now >= target_time:
        target_time += datetime.timedelta(days=1)
        
    duration_seconds = (target_time - now).total_seconds()
    return int(duration_seconds)

def record_stream(duration, filename):
    print(f"Запись радио начата. Будет идти {duration} сек. до 18:00.")
    start_time = time.time()
    
    try:
        response = requests.get(STREAM_URL, stream=True, timeout=15)
        response.raise_for_status()
        
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=4096):
                if time.time() - start_time > duration:
                    break
                if chunk:
                    f.write(chunk)
                    
        print(f"Запись успешно завершена и сохранена в файл: {filename}")
    except Exception as e:
        print(f"Произошла ошибка при записи потока: {e}")

if __name__ == "__main__":
    seconds_to_record = get_recording_duration()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"radio_record_{timestamp}.mp3"
    
    record_stream(seconds_to_record, file_name)
