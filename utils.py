import json

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def load_assets(asset_type):
    filename = f"{asset_type}.json"

    path = Path(filename)

    if not path.exists():
        print(f"File not found: {filename}")
        return {}

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)

def save_assets(asset_type, assets):
    path = BASE_DIR / f"{asset_type}.json"
    temp_path = BASE_DIR / f"{asset_type}.tmp"

    with temp_path.open("w", encoding="utf-8") as file:
        json.dump(
            assets,
            file,
            ensure_ascii=False,
            indent=4
        )

    temp_path.replace(path)
