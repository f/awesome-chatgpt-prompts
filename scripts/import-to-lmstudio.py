#!/usr/bin/env python3
"""
Import prompts.csv into LM Studio as config presets.

Usage:
  python3 scripts/import-to-lmstudio.py              # import all prompts
  python3 scripts/import-to-lmstudio.py --dev-only   # import only for_devs=TRUE
  python3 scripts/import-to-lmstudio.py --dry-run    # preview without writing
"""

import csv
import json
import os
import re
import sys
import argparse
from pathlib import Path

PRESETS_DIR = Path.home() / ".lmstudio" / "config-presets"
CSV_PATH = Path(__file__).parent.parent / "prompts.csv"


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text).strip()
    text = re.sub(r"[\s_-]+", "-", text)
    return text[:60]


def make_preset(act: str, prompt: str) -> dict:
    return {
        "identifier": f"@local:{slugify(act)}",
        "name": act,
        "changed": True,
        "operation": {
            "fields": [
                {
                    "key": "llm.prediction.systemPrompt",
                    "value": prompt,
                }
            ]
        },
        "load": {"fields": []},
    }


def main():
    parser = argparse.ArgumentParser(description="Import prompts.chat CSV into LM Studio presets")
    parser.add_argument("--dev-only", action="store_true", help="Only import for_devs=TRUE prompts")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be created without writing files")
    args = parser.parse_args()

    csv.field_size_limit(10_000_000)

    prompts = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            act = row.get("act", "").strip()
            prompt = row.get("prompt", "").strip()
            for_devs = row.get("for_devs", "").strip().upper()

            if not act or not prompt:
                continue
            if args.dev_only and for_devs != "TRUE":
                continue

            prompts.append((act, prompt))

    print(f"Found {len(prompts)} prompts to import")

    if args.dry_run:
        for act, prompt in prompts[:5]:
            print(f"  • {act!r} → {slugify(act)}.preset.json")
        if len(prompts) > 5:
            print(f"  … and {len(prompts) - 5} more")
        print("\n(dry-run: no files written)")
        return

    PRESETS_DIR.mkdir(parents=True, exist_ok=True)

    written = 0
    skipped = 0
    seen_slugs: dict[str, int] = {}

    for act, prompt in prompts:
        slug = slugify(act)

        # deduplicate: if slug collides, append a counter
        if slug in seen_slugs:
            seen_slugs[slug] += 1
            slug = f"{slug}-{seen_slugs[slug]}"
        else:
            seen_slugs[slug] = 0

        dest = PRESETS_DIR / f"{slug}.preset.json"

        if dest.exists():
            skipped += 1
            continue

        preset = make_preset(act, prompt)
        dest.write_text(json.dumps(preset, indent=2, ensure_ascii=False), encoding="utf-8")
        written += 1

    print(f"Done: {written} presets written to {PRESETS_DIR}")
    if skipped:
        print(f"Skipped {skipped} (already existed — delete them first to re-import)")
    print("\nRestart LM Studio (or switch presets panel) to see them.")


if __name__ == "__main__":
    main()
