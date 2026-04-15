import os
import json

MEDIA_FOLDER = "media"

photo_exts = {".jpg", ".jpeg", ".png"}
video_exts = {".mp4", ".mov"}
audio_exts = {".wav"}

media = {
    "photo": [],
    "video": [],
    "audio": []
}

if not os.path.isdir(MEDIA_FOLDER):
    print(f'Folder "{MEDIA_FOLDER}" not found.')
    raise SystemExit(1)

for filename in os.listdir(MEDIA_FOLDER):
    full_path = os.path.join(MEDIA_FOLDER, filename)

    if not os.path.isfile(full_path):
        continue

    ext = os.path.splitext(filename)[1].lower()

    if ext in photo_exts:
        media["photo"].append(filename)
    elif ext in video_exts:
        media["video"].append(filename)
    elif ext in audio_exts:
        media["audio"].append(filename)

media["photo"].sort(key=str.lower)
media["video"].sort(key=str.lower)
media["audio"].sort(key=str.lower)

media["all"] = sorted(
    media["photo"] + media["video"] + media["audio"],
    key=str.lower
)

with open("media.json", "w", encoding="utf-8") as f:
    json.dump(media, f, indent=2, ensure_ascii=False)

print("Generated media.json")
print(f'Photos: {len(media["photo"])}')
print(f'Videos: {len(media["video"])}')
print(f'Audio:  {len(media["audio"])}')
print(f'Total:  {len(media["all"])}')