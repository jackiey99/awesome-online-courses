#!/usr/bin/env python3
"""Convert a YouTube auto-caption VTT file to deduplicated plain text.

Usage:
    python clean_vtt.py <input.vtt> [<input2.vtt> ...]

For each input, writes a sibling <input>.txt with VTT cues stripped, inline
word-level timestamps removed, and rolling-caption repetitions collapsed.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


TAG_RE = re.compile(r"<[^>]+>")
TIMESTAMP_RE = re.compile(r"\d{2}:\d{2}:\d{2}\.\d{3}\s*-->")


def clean(text: str) -> str:
    out: list[str] = []
    seen_recent: list[str] = []  # short rolling window for dedup
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith(("WEBVTT", "Kind:", "Language:", "NOTE")):
            continue
        if TIMESTAMP_RE.search(line):
            continue
        line = TAG_RE.sub("", line).strip()
        if not line:
            continue
        # Drop if identical to any of the last few emitted lines (kills
        # the YouTube rolling-caption "previous line repeated" pattern).
        if line in seen_recent:
            continue
        out.append(line)
        seen_recent.append(line)
        if len(seen_recent) > 4:
            seen_recent.pop(0)
    return "\n".join(out) + "\n"


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 1
    for path_str in argv[1:]:
        src = Path(path_str)
        dst = src.with_suffix(".txt")
        dst.write_text(clean(src.read_text(encoding="utf-8")), encoding="utf-8")
        print(f"{src} -> {dst} ({dst.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
