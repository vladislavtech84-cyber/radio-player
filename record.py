import urllib.request
import time
import sys

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"
RECORD_DURATION = int(sys.argv[1]) if len(sys.argv) > 1 else 12600

# Определяем, какую часть писать, исходя из текущего часа по МСК (UTC + 3)
current_hour_msk = (time.gmtime().tm_hour + 3) % 24
filename = "part_1.mp3" if current_hour_msk < 21 else "part_2.mp3"

print(f"Робот запущен. Запись потока в файл {filename} на {RECORD_DURATION} секунд...")

try:
    with urllib.request.urlopen(STREAM_URL) as response, open(filename, 'wb') as out_file:
        start_time = time.time()
        while time.time() - start_time < RECORD_DURATION:
            chunk = response.read(1024 * 64)
            if not chunk:
                break
            out_file.write(chunk)
    print(f"Запись файла {filename} успешно завершена!")
except Exception as e:
    print(f"Ошибка при записи: {e}")
