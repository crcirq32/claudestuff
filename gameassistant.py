from pathlib import Path
import re
import subprocess
import tempfile

import mlx.core as mx
from airllm import AutoModel

MODEL_ID = "Qwen/Qwen3-8B"
MAX_INPUT_TOKENS = 4096
MAX_NEW_TOKENS = 1200
MAX_FILE_CHARS = 5_000

# The project is the folder you launch this script from.
ROOT = Path.cwd().resolve()
SOURCE_SUFFIXES = {
    ".swift", ".md", ".txt", ".json", ".plist", ".yaml", ".yml",
    ".xml", ".entitlements", ".pbxproj",
}
SKIP_DIRS = {
    ".git", ".build", "DerivedData", "Pods", "Carthage",
    ".swiftpm", "node_modules", "build",
}

print(f"Loading {MODEL_ID}…")
model = AutoModel.from_pretrained(MODEL_ID)
tokenizer = model.tokenizer

def project_files():
    found = []
    for path in ROOT.rglob("*"):
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        if path.is_file() and (
            path.suffix.lower() in SOURCE_SUFFIXES
            or path.name in {"Package.swift", "README"}
        ):
            found.append(path)
    return sorted(found)

def safe_file(relative_path):
    path = (ROOT / relative_path).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError("That path is outside the CyberDefense folder.")
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {relative_path}")
    return path

def generate(prompt):
    encoded = tokenizer(
        prompt,
        return_tensors="np",
        truncation=True,
        max_length=MAX_INPUT_TOKENS,
    )
    result = model.generate(
        mx.array(encoded["input_ids"]),
        max_new_tokens=MAX_NEW_TOKENS,
        use_cache=True,
        return_dict_in_generate=True,
    )
    new_tokens = result.sequences[0].tolist()[encoded["input_ids"].shape[1]:]
    return tokenizer.decode(new_tokens, skip_special_tokens=True)

def strip_fence(text):
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[-1].strip() == "```":
            text = "\n".join(lines[1:-1])
    return text.strip()

def check_patch_paths(patch):
    for line in patch.splitlines():
        if line.startswith(("+++ ", "--- ")):
            name = line[4:].split("\t")[0]
            if name == "/dev/null":
                continue
            if name.startswith(("a/", "b/")):
                name = name[2:]
            if not (ROOT / name).resolve().is_relative_to(ROOT):
                raise ValueError(f"Patch tries to change a path outside the project: {name}")

def apply_patch(patch):
    check_patch_paths(patch)
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".patch", encoding="utf-8", delete=False
    ) as temp:
        temp.write(patch + "\n")
        patch_file = Path(temp.name)

    try:
        check = subprocess.run(
            ["git", "apply", "--check", str(patch_file)],
            cwd=ROOT, text=True, capture_output=True,
        )
        if check.returncode:
            print("Git could not validate the patch:")
            print(check.stderr or check.stdout)
            return

        print("\nProposed patch:\n")
        print(patch)
        if input("\nApply this patch? Type 'yes' to confirm: ").strip() != "yes":
            print("Patch not applied.")
            return

        result = subprocess.run(
            ["git", "apply", str(patch_file)],
            cwd=ROOT, text=True, capture_output=True,
        )
        if result.returncode:
            print("Patch failed to apply:")
            print(result.stderr or result.stdout)
        else:
            print("Patch applied. Review it with: git diff")
    finally:
        patch_file.unlink(missing_ok=True)

def context_text(loaded):
    if not loaded:
        return "(No source files loaded yet. Use :read path/to/file.)"
    return "\n\n".join(
        f"===== {name} =====\n{content}" for name, content in loaded.items()
    )

def main():
    if not (ROOT / ".git").exists():
        print("Warning: this folder may not be a Git repository.")
        print("For safe patch review/application, initialize or use the project's Git repo.")

    loaded = {}
    print(f"\nCyberDefense assistant — project folder: {ROOT}")
    print("Commands: :map, :read FILE, :loaded, :clear, :ask TASK, :edit TASK, :quit")

    while True:
        try:
            line = input("\n> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if line in {":quit", ":q"}:
            break

        if line == ":map":
            for path in project_files():
                print(path.relative_to(ROOT))
            continue

        if line.startswith(":read "):
            name = line[6:].strip()
            try:
                path = safe_file(name)
                text = path.read_text(encoding="utf-8", errors="replace")
                if len(text) > MAX_FILE_CHARS:
                    print(f"File is large ({len(text)} characters); not loaded.")
                    continue
                loaded[str(path.relative_to(ROOT))] = text
                print(f"Loaded {path.relative_to(ROOT)}")
            except Exception as error:
                print(f"Could not load file: {error}")
            continue

        if line == ":loaded":
            print("\n".join(loaded) if loaded else "No files loaded.")
            continue

        if line == ":clear":
            loaded.clear()
            print("Cleared loaded-file context.")
            continue

        if line.startswith(":ask "):
            task = line[5:].strip()
            prompt = f"""You are a senior iOS/Swift game developer helping with CyberDefense,
an existing tower-defense game. Use the supplied project map and loaded source.
Respect the project's current architecture. Be specific; do not invent files
or APIs. If more context is needed, name the file to load.

PROJECT FILE MAP:
{chr(10).join(str(p.relative_to(ROOT)) for p in project_files())}

LOADED FILES:
{context_text(loaded)}

USER REQUEST:
{task}
"""
            print("\n" + generate(prompt))
            continue

        if line.startswith(":edit "):
            task = line[6:].strip()
            if not loaded:
                print("Load the relevant Swift files first with :read FILE.")
                continue
            prompt = f"""You are editing an existing iOS Swift game project named CyberDefense.
Make the smallest change that fulfills the request. Use only the loaded files.
Return ONLY a standard unified diff that `git apply` can apply, with paths
relative to the project root, such as `a/CyberDefense/GameScene.swift` and
`b/CyberDefense/GameScene.swift`. Do not use Markdown fences. Do not include
explanations before or after the diff. If the request cannot be safely handled
from the loaded context, return exactly: NEED MORE CONTEXT

LOADED FILES:
{context_text(loaded)}

REQUEST:
{task}
"""
            patch = strip_fence(generate(prompt))
            if patch == "NEED MORE CONTEXT" or not patch.startswith("--- "):
                print("No applicable patch returned. Load more relevant files with :read.")
                print(patch[:3000])
                continue
            apply_patch(patch)
            continue

        print("Use :map, :read FILE, :ask TASK, :edit TASK, :clear, or :quit.")

if __name__ == "__main__":
    main()

