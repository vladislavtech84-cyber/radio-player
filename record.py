import datetime
import time
import requests
import signal
import os

STREAM_URL = "https://radio.5-tv.ru/radio.mp3"
is_running = True

def handle_stop_signal(signum, frame):
    global is_running
    print("\n[!] Получена команда экстренной остановки. Закрываем поток и сохраняем аудио...")
    is_running = False

signal.signal(signal.SIGTERM, handle_stop_signal)
signal.signal(signal.SIGINT, handle_stop_signal)

def get_recording_duration():
    now = datetime.datetime.now()
    target_time = now.replace(hour=18, minute=0, second=0, microsecond=0)
    if now >= target_time:
        target_time += datetime.timedelta(days=1)
    return int((target_time - now).total_seconds())

# Функция, которая записывает ссылку на новую запись прямо внутрь index.html
def update_html_history(mp3_filename):
    html_path = "index.html"
    if not os.path.exists(html_path):
        return
        
    readable_date = datetime.datetime.now().strftime("%d.%m.%Y в %H:%M")
    # Создаем красивую HTML-строчку для списка
    new_entry = f'<!--ENTRY-->\n<div style="padding:8px; border-bottom:1px solid #334155; display:flex; justify-content:between; font-size:14px;"><span>📅 Запись от {readable_date}</span><button onclick="playSpecificRecord(\'{mp3_filename}\')" style="background:#3b82f6; color:white; border:none; border-radius:3px; padding:2px 8px; cursor:pointer;">▶️ Слушать</button></div>\n'
    
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    # Вставляем новую запись сразу после метки архива
    if "<!--ARCHIVE_START-->" in html_content:
        updated_content = html_content.replace("<!--ARCHIVE_START-->", f"<!--ARCHIVE_START-->\n{new_entry}")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print("[+] Список записей в index.html успешно обновлен!")

def record_stream(duration, filename):
    global is_running
    print(f"Запись радио начата. Будет идти {duration} сек. до 18:00.")
    start_time = time.time()
    
    try:
        response = requests.get(STREAM_URL, stream=True, timeout=15)
        response.raise_for_status()
        
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=4096):
                if not is_running or (time.time() - start_time > duration):
                    break
                if chunk:
                    f.write(chunk)
                    
        print(f"Поток успешно записан в файл: {filename}")
        # Запускаем обновление страницы index.html
        update_html_history(filename)
        
    except Exception as e:
        print(f"Критическая ошибка стрима: {e}")

if __name__ == "__main__":
    seconds_to_record = get_recording_duration()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"radio_record_{timestamp}.mp3"
    
    record_stream(seconds_to_record, file_name)
