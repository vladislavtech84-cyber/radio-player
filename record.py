import requests
import time

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"
# 5 минут = 300 секунд
RECORD_DURATION = 300 
output_filename = "test_record.mp3"

print(f"Старт тестовой записи: {STREAM_URL}")
start_time = time.time()

try:
    with requests.get(STREAM_URL, stream=True, timeout=30) as response:
        response.raise_for_status()
        with open(output_filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=16384):
                if chunk:
                    f.write(chunk)
                if time.time() - start_time >= RECORD_DURATION:
                    break
    print("Тестовая запись успешно завершена на сервере.")
except Exception as e:
    print(f"Ошибка: {e}")
