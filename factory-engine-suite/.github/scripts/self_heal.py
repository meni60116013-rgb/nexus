import re, sys, os

LOG_PATH = sys.argv[1] if len(sys.argv) > 1 else "build_log.txt"
APP_GRADLE = "app/build.gradle.kts"
ROOT_GRADLE = "build.gradle.kts"
GRADLE_PROPS = "gradle.properties"

with open(LOG_PATH, encoding="utf-8", errors="ignore") as f:
    log = f.read()

applied = []

def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()

def write(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# --- Regla 1: falta "namespace" en app/build.gradle.kts ---
if "Namespace not specified" in log and os.path.exists(APP_GRADLE):
    content = read(APP_GRADLE)
    m = re.search(r'applicationId\s*=\s*"([^"]+)"', content)
    if m and "namespace =" not in content:
        pkg = m.group(1)
        content = content.replace(
            "android {",
            f'android {{\n    namespace = "{pkg}"',
            1
        )
        write(APP_GRADLE, content)
        applied.append("Se agregó 'namespace' faltante en app/build.gradle.kts")

# --- Regla 2: OutOfMemory / Metaspace del daemon de Gradle ---
if ("OutOfMemoryError" in log or "Metaspace" in log) and os.path.exists(GRADLE_PROPS):
    content = read(GRADLE_PROPS)
    if "Xmx2048m" in content:
        content = content.replace("Xmx2048m", "Xmx4096m")
        write(GRADLE_PROPS, content)
        applied.append("Se aumentó memoria del daemon de Gradle (Xmx2048m -> Xmx4096m)")

# --- Regla 3: versión de Kotlin incompatible con Gradle ---
if "is only compatible with Gradle" in log and os.path.exists(ROOT_GRADLE):
    content = read(ROOT_GRADLE)
    new_content = re.sub(
        r'org\.jetbrains\.kotlin\.android"\)\s+version\s+"[^"]+"',
        'org.jetbrains.kotlin.android") version "1.9.24"',
        content
    )
    if new_content != content:
        write(ROOT_GRADLE, new_content)
        applied.append("Se actualizó la versión del plugin de Kotlin a 1.9.24")

# --- Regla 4: dependencia no resuelta (fallo de red o versión mala) -> reintento simple ---
m = re.search(r"Failed to resolve:\s*([\w\.\-:]+)", log)
if m and os.path.exists(APP_GRADLE):
    dep = m.group(1)
    content = read(APP_GRADLE)
    if dep.split(":")[0:2] and dep in content:
        # baja a una versión estable conocida si termina en un número de versión
        base = ":".join(dep.split(":")[:-1])
        content = re.sub(re.escape(dep), base + ":1.12.0", content)
        write(APP_GRADLE, content)
        applied.append(f"Se ajustó la versión de la dependencia no resuelta: {dep}")

# --- Regla 5: AGP incompatible con Gradle ---
if "requires Android Gradle plugin" in log and os.path.exists(ROOT_GRADLE):
    content = read(ROOT_GRADLE)
    new_content = re.sub(
        r'com\.android\.application"\)\s+version\s+"[^"]+"',
        'com.android.application") version "8.3.2"',
        content
    )
    if new_content != content:
        write(ROOT_GRADLE, new_content)
        applied.append("Se actualizó Android Gradle Plugin (AGP) a 8.3.2")

# --- Resultado ---
with open("fixes_applied.txt", "w", encoding="utf-8") as f:
    if applied:
        f.write("\n".join(applied))
    else:
        f.write("")

if applied:
    print("Reparaciones aplicadas:")
    for a in applied:
        print(" -", a)
    sys.exit(0)
else:
    print("No se encontró ninguna regla de reparación conocida para este error.")
    sys.exit(2)
