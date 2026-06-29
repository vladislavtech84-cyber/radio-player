import requests
import time
from datetime import datetime

# Ваша ссылка на радио (полная, без изменений)
STREAM_URL = "https://radio.5-tv.ru/radio.mp3"

# Длительность одной записи — ровно 1 час (60 * 60 = 3600 секунд)
RECORD_DURATION = 3600 

current_time = datetime.now().strftime("%Y-%m-%d_%H-%M")
output_filename = f"record_{current_time}.mp3"

print(f"Старт записи потока: {STREAM_URL}")
print(f"Длительность: 1 час. Файл: {output_filename}")

start_time = time.time()

try:
    with requests.get(STREAM_URL, stream=True, timeout=30) as response:
        response.raise_for_status()
        
        with open(output_filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=16384):
                if chunk:
                    f.write(chunk)
                
                if time.time() - start_time >= RECORD_DURATION:
                    print("Время записи истекло.")
                    break
                    
    print("Запись успешно завершена.")

except Exception as e:
    print(f"Произошла ошибка при записи: {e}")
