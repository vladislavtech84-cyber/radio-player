import urllib.request
import time
import sys

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"

# Получаем параметры: 8 циклов по 60 секунд
cycles = int(sys.argv[1]) if len(sys.argv) > 1 else 8
duration = int(sys.argv[2]) if len(sys.argv) > 2 else 60

print(f"Старт теста: {cycles} циклов по {duration} секунд.")

for i in range(1, cycles + 1):
    output_file = f"test_{i}.mp3"
    print(f"Цикл {i}/{cycles}: Запись в {output_file}...")
    
    try:
        with urllib.request.urlopen(STREAM_URL) as response, open(output_file, 'wb') as out_file:
            start_time = time.time()
            while time.time() - start_time < duration:
                chunk = response.read(1024 * 32)
                if not chunk:
                    break
                out_file.write(chunk)
        print(f"Цикл {i} успешно завершен.")
    except Exception as e:
        print(f"Ошибка на цикле {i}: {e}")
        
    # Небольшая пауза в 1 секунду перед следующим циклом
    time.sleep(1)

print("Все 8 циклов успешно записаны!")
