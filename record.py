import urllib.request
import time
import sys

# URL вашего радиопотока
STREAM_URL = "https://radio.5-tv.ru/radio.mp3" 

# Длительность записи: 1 час (3600 секунд)
RECORD_DURATION = 60

OUTPUT_FILE = f"record_{int(time.time())}.mp3"

print(f"Старт записи потока: {STREAM_URL}")
try:
    # Добавляем User-Agent, чтобы сервер радио не блокировал робота
    req = urllib.request.Request(STREAM_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(OUTPUT_FILE, 'wb') as out_file:
        start_time = time.time()
        while time.time() - start_time < RECORD_DURATION:
            chunk = response.read(1024)
            if not chunk:
                break
            out_file.write(chunk)
    print(f"Запись успешно сохранена как {OUTPUT_FILE}")
except Exception as e:
    print(f"Ошибка при записи: {e}")
    sys.exit(1)
