import urllib.request
import time
import sys

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"
RECORD_DURATION = int(sys.argv) if len(sys.argv) > 1 else 600
filename = "part_1.mp3"

print(f"Запись запущена в облаке. Файл: {filename}, Длительность: {RECORD_DURATION} сек.")

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
    print("Файл успешно записан!")
except Exception as e:
    print(f"Ошибка: {e}")
    sys.exit(1)
