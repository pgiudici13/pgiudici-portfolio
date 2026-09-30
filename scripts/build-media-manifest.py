#!/usr/bin/env python3
"""Genera il catalogo statico dei media pubblicati nel portfolio."""

import json
from pathlib import Path

MEDIA_DIR = Path("assets/media")
OUTPUT = MEDIA_DIR / "manifest.json"
CATALOG = MEDIA_DIR / "catalog.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v"}


def readable_title(stem: str) -> str:
    return stem.replace("_", " ").replace("-", " ").strip().title()


def main() -> None:
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    catalog = {}
    if CATALOG.exists():
        raw_catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
        catalog = {entry["file"]: entry for entry in raw_catalog if entry.get("file")}

    entries = []
    for path in sorted(MEDIA_DIR.iterdir()):
        if not path.is_file() or path.name == "manifest.json":
            continue
        suffix = path.suffix.lower()
        if suffix in IMAGE_EXTENSIONS:
            media_type = "image"
        elif suffix in VIDEO_EXTENSIONS:
            media_type = "video"
        else:
            continue
        metadata = catalog.get(path.name, {})
        entries.append({
            "src": f"assets/media/{path.name}",
            "file": path.name,
            "title": metadata.get("title") or readable_title(path.stem),
            "description": metadata.get("description") or "Dal mio archivio personale.",
            "type": media_type,
            "category": metadata.get("category") or ("photography" if media_type == "image" else "video"),
        })
    OUTPUT.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
