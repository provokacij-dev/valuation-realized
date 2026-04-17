#!/usr/bin/env python3
"""
Zip the valuable Claude Code state (memory files, settings, global CLAUDE.md)
into a single timestamped archive for migration to another machine.

Skips skills/ and plugins/ by default — those are reinstallable via the
gstack plugin and its `/gstack-upgrade` command. Also skips session
history, caches, browser profile, IDE auth, and other state that
should NOT migrate.

Usage:
    python backup-claude-state.py [output_dir]
    python backup-claude-state.py [output_dir] --include-skills

Defaults to the user's Desktop if no output dir is given.
"""

import sys
import zipfile
from datetime import datetime
from pathlib import Path


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    include_skills = "--include-skills" in sys.argv

    home = Path.home()
    claude_dir = home / ".claude"
    if not claude_dir.is_dir():
        print(f"ERROR: {claude_dir} does not exist", file=sys.stderr)
        return 1

    # Valuable, non-reinstallable paths. Everything else under ~/.claude is
    # either session/cache state (excluded) or reinstallable (skills, plugins).
    include_paths = [
        claude_dir / "CLAUDE.md",
        claude_dir / "settings.json",
        claude_dir / "projects" / "C--Users-vrimsaite-Desktop-VR" / "memory",
    ]
    if include_skills:
        include_paths.append(claude_dir / "skills")

    out_dir = Path(args[0]) if args else home / "Desktop"
    out_dir.mkdir(parents=True, exist_ok=True)

    stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    out_path = out_dir / f"claude-state-{stamp}.zip"

    included_count = 0
    skipped: list[str] = []

    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for src in include_paths:
            if not src.exists():
                skipped.append(str(src))
                continue
            if src.is_file():
                arcname = src.relative_to(home)
                zf.write(src, arcname)
                included_count += 1
            else:
                for p in src.rglob("*"):
                    if p.is_file():
                        arcname = p.relative_to(home)
                        zf.write(p, arcname)
                        included_count += 1

    size_mb = out_path.stat().st_size / 1024 / 1024
    print(f"Wrote {out_path}")
    print(f"  {included_count} files, {size_mb:.2f} MB")
    if skipped:
        print("  Skipped (not present on this machine):")
        for s in skipped:
            print(f"    {s}")
    print()
    print("Next steps:")
    print("  1. Upload this zip to Google Drive (any folder).")
    print("  2. On the new machine, download + unzip into your home directory")
    print("     so files land under ~/.claude/ .")
    print("  3. Start Claude Code. To reinstall skills: /gstack-upgrade")
    return 0


if __name__ == "__main__":
    sys.exit(main())
