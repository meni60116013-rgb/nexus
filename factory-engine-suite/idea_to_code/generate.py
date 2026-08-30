#!/usr/bin/env python3
import json, os, sys, urllib.request
API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-4-6"
SYSTEM_PROMPT = """Eres un generador de esqueletos de proyectos de software.
Responde SOLO con JSON: {"project_name": "...", "files": [{"path": "...", "content": "..."}]}"""
def generate_skeleton(idea):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("Falta ANTHROPIC_API_KEY (aún no configurada — usa el chat mientras tanto).")
    payload = json.dumps({"model": MODEL, "max_tokens": 4000, "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": idea}]}).encode()
    req = urllib.request.Request(API_URL, data=payload, headers={
        "Content-Type": "application/json", "x-api-key": api_key,
        "anthropic-version": "2023-06-01"})
    data = json.loads(urllib.request.urlopen(req).read())
    text = "".join(b.get("text","") for b in data.get("content",[]) if b.get("type")=="text")
    return json.loads(text.strip().removeprefix("```json").removesuffix("```").strip())
if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit('Uso: python3 generate.py "idea"')
    sk = generate_skeleton(" ".join(sys.argv[1:]))
    for fe in sk["files"]:
        p = os.path.join(sk["project_name"], fe["path"])
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, "w").write(fe["content"])
        print("creado:", p)
