from pathlib import Path

import mlx.core as mx
from airllm import AutoModel

# Start with a smaller model for a first test.
MODEL_ID = "Qwen/Qwen3-8B"
MAX_INPUT_TOKENS = 409600
MAX_NEW_TOKENS = 512

ROOT = Path.cwd().resolve()
model = AutoModel.from_pretrained(MODEL_ID)
tokenizer = model.tokenizer
files = {}

def ask(question):
    context = "\n\n".join(
        f"--- {name} ---\n{text}" for name, text in files.items()
    ) or "(No project files loaded. Use :read path/to/file.)"

    messages = [
        {
            "role": "system",
            "content": (
                "You are a coding assistant. Analyze the supplied project files. "
                "Suggest changes as clear instructions or unified diffs. "
                "Do not claim to have changed files."
            ),
        },
        {
            "role": "user",
            "content": f"Project files:\n{context}\n\nRequest:\n{question}",
        },
    ]

    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
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

def safe_project_file(argument):
    path = (ROOT / argument).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError("That path is outside the project folder.")
    if not path.is_file():
        raise FileNotFoundError(f"Not a file: {argument}")
    return path

print(f"AirLLM coding assistant — project: {ROOT}")
print("Commands: :read relative/path, :files, :clear, :quit")

while True:
    try:
        line = input("\nYou> ").strip()
    except (EOFError, KeyboardInterrupt):
        break

    if line in {":quit", ":q"}:
        break
    if line == ":files":
        print("\n".join(files) if files else "No files loaded.")
        continue
    if line == ":clear":
        files.clear()
        print("Loaded-file context cleared.")
        continue
    if line.startswith(":read "):
        name = line[6:].strip()
        try:
            path = safe_project_file(name)
            files[str(path.relative_to(ROOT))] = path.read_text(
                encoding="utf-8", errors="replace"
            )
            print(f"Loaded {path.relative_to(ROOT)}")
        except Exception as error:
            print(f"Could not read file: {error}")
        continue
    if not line:
        continue

    print("\nAssistant>\n" + ask(line))

