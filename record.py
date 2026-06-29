import requests
import time
from datetime import datetime

# Ваша ссылка на радио (без изменений)
STREAM_URL = "https://5-tv.ru"

# Длительность записи в секундах (8 часов = 8 * 60 * 60)
RECORD_DURATION = 28800 

# Имя файла с текущей датой и временем
current_time = datetime.now().strftime("%Y-%m-%d_%H-%M")
output_filename = f"record_{current_time}.mp3"

print(f"Старт записи потока: {STREAM_URL}")
print(f"Длительность: 8 часов. Файл: {output_filename}")

start_time = time.time()

try:
    # Открываем поток для чтения
    with requests.get(STREAM_URL, stream=True, timeout=15) as response:
        response.raise_for_status()
        
        with open(output_filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                
                # Проверяем, прошло ли 8 часов
                if time.time() - start_time >= RECORD_DURATION:
                    print("Время записи истекло.")
                    break
                    
    print("Запись успешно завершена и сохранена.")

except Exception as e:
    print(f"Произошла ошибка при записи: {e}")
