import urllib.request
import time
import sys

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"
# Принимает 600 секунд из настроек GitHub
RECORD_DURATION = int(sys.argv) if len(sys.argv) > 1 else 600
filename = "part_1.mp3"

print(f"Облачный тест запущен. Запись в {filename} на {RECORD_DURATION} секунд...")

req = urllib.request.Request(
    STREAM_URL, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

try:
    with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
        start_time = time.time()
        while time.time() - start_time < RECORD_DURATION:
            chunk = response.read(1024 * 64)
            if not chunk:
                break
            out_file.write(chunk)
    print("Запись 10 минут успешно завершена!")
except Exception as e:
    print(f"Ошибка записи: {e}")
    sys.exit(1)
