pythonimport urllib.request
import time
import sys

# ⚠️ ВСТАВЬТЕ ССЫЛКУ НА ВАШ ПОТОК НИЖЕ ВМЕСТО "ССЫЛКА_НА_ВАШЕ_РАДИО"
STREAM_URL = "ССЫЛКА_НА_ВАШЕ_РАДИО" 

# Длительность записи выставлена на 1 час (3600 секунд)
RECORD_DURATION = 3600 

OUTPUT_FILE = f"record_{int(time.time())}.mp3"

print(f"Старт записи потока: {STREAM_URL}")
try:
    with urllib.request.urlopen(STREAM_URL) as response, open(OUTPUT_FILE, 'wb') as out_file:
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
