# Propiedad Intelectual Protegida
#!/bin/bash

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "❌ No estás en un repo git"; exit 1; }

echo "📦 Guardando cambios locales..."
git stash

echo "🔍 Detectando rama remota..."
REMOTE=$(git remote | head -n1)
LOCAL_BRANCH=$(git branch --show-current)
REMOTE_BRANCH=$(git ls-remote --heads $REMOTE | grep -E "/(main|principal|master)$" | sed 's|.*refs/heads/||' | head -n1)

echo "🔗 Conectando '$LOCAL_BRANCH' → '$REMOTE/$REMOTE_BRANCH'"
git branch --set-upstream-to=$REMOTE/$REMOTE_BRANCH $LOCAL_BRANCH

echo "⬇️ Haciendo pull..."
git pull

echo "🔓 Restaurando cambios locales..."
git stash pop

echo "✅ ¡Listo! Todo sincronizado."
