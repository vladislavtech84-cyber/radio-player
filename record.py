import urllib.request
import time
import sys

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"
# Длительность: 12600 сек (3.5 часа). Если запускаем вручную для теста, ставим 60 сек
RECORD_DURATION = int(sys.argv[1]) if len(sys.argv) > 1 else 12600

# Определяем имя файла по текущему времени (МСК = UTC + 3)
current_hour_msk = (time.gmtime().tm_hour + 3) % 24
filename = "part_1.mp3" if current_hour_msk < 21 else "part_2.mp3"

print(f"Старт записи в файл {filename} на {RECORD_DURATION} секунд...")

# Маскируемся под реальный браузер, чтобы радио не заблокировало бота
req = urllib.request.Request(
    STREAM_URL, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
)

try:
    with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
        start_time = time.time()
        while time.time() - start_time < RECORD_DURATION:
            chunk = response.read(1024 * 64) # Читаем крупными порциями по 64 КБ
            if not chunk:
                break
            out_file.write(chunk)
    print(f"Запись успешно завершена и сохранена в {filename}")
except Exception as e:
    print(f"Критическая ошибка при записи: {e}")
    sys.exit(1)
