import urllib.request
import time
import sys

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"
RECORD_DURATION = 600 # 10 минут

# Имя файла будет содержать время окончания записи (part_1250.mp3)
end_time_struct = time.localtime(time.time() + RECORD_DURATION)
filename = f"part_{time.strftime('%H%M', end_time_struct)}.mp3"

print(f"Запуск записи по ТАЙМЕРУ. Файл: {filename}, Длительность: {RECORD_DURATION} сек.")

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
    print(f"Файл {filename} успешно записан!")
except Exception as e:
    print(f"Ошибка таймера: {e}")
    sys.exit(1)
