import urllib.request
import time
import sys

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"
RECORD_DURATION = 600 # 10 минут
filename = "test_timer.mp3"

print(f"Старт записи по таймеру в файл {filename} на {RECORD_DURATION} секунд...")

req = urllib.request.Request(
    STREAM_URL, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
)

try:
    with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
        start_time = time.time()
        while time.time() - start_time < RECORD_DURATION:
            chunk = response.read(1024 * 64)
            if not chunk:
                break
            out_file.write(chunk)
    print(f"Запись файла {filename} успешно завершена!")
except Exception as e:
    print(f"Ошибка при записи: {e}")
    sys.exit(1)
