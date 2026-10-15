from pathlib import Path
import argparse
import difflib
import subprocess
import sys

ROOT = Path.cwd().resolve()


def safe_file(relative_path: str) -> Path:
    path = (ROOT / relative_path).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError("File path must stay inside the project folder.")
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {relative_path}")
    return path


def show_git_diff() -> int:
    result = subprocess.run(
        ["git", "diff", "--"],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode:
        print(result.stderr or result.stdout, file=sys.stderr)
        return result.returncode

    print(result.stdout if result.stdout.strip() else "No unstaged changes.")
    return 0


def replace_text(relative_path: str, old: str, new: str) -> int:
    try:
        path = safe_file(relative_path)
        original = path.read_text(encoding="utf-8")
    except (OSError, ValueError) as error:
        print(f"Cannot edit file: {error}", file=sys.stderr)
        return 1

    count = original.count(old)
    if count != 1:
        print(
            f"Expected the old text exactly once, but found it {count} times. "
            "No change made.",
            file=sys.stderr,
        )
        return 1

    updated = original.replace(old, new, 1)
    preview = difflib.unified_diff(
        original.splitlines(keepends=True),
        updated.splitlines(keepends=True),
        fromfile=f"a/{relative_path}",
        tofile=f"b/{relative_path}",
    )

    print("Proposed change:\n")
    print("".join(preview), end="")
    if input("\nApply this change? Type 'yes' to confirm: ").strip() != "yes":
        print("No change made.")
        return 0

    try:
        path.write_text(updated, encoding="utf-8")
    except OSError as error:
        print(f"Could not save file: {error}", file=sys.stderr)
        return 1

    print("\nSaved. Current Git diff:\n")
    return show_git_diff()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Safely apply a simple exact-text edit or show the Git diff."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    replace_parser = subparsers.add_parser("replace", help="Replace exact text in a file")
    replace_parser.add_argument("file", help="Path relative to the project folder")
    replace_parser.add_argument("old", help="Exact text to find")
    replace_parser.add_argument("new", help="Replacement text")

    subparsers.add_parser("git", help="Show unstaged Git changes")

    args = parser.parse_args()

    if args.command == "replace":
        return replace_text(args.file, args.old, args.new)
    return show_git_diff()


if __name__ == "__main__":
    raise SystemExit(main())

