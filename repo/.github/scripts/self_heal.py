import re, sys, os, glob

LOG_PATH = sys.argv[1] if len(sys.argv) > 1 else "build_log.txt"
APP_GRADLE = "app/build.gradle.kts"
ROOT_GRADLE = "build.gradle.kts"
GRADLE_PROPS = "gradle.properties"
MANIFEST = "app/src/main/AndroidManifest.xml"
SETTINGS = "settings.gradle.kts"

with open(LOG_PATH, encoding="utf-8", errors="ignore") as f:
    log = f.read()

applied = []

def read(p):
    with open(p, encoding="utf-8") as f: return f.read()
def write(p, c):
    with open(p, "w", encoding="utf-8") as f: f.write(c)
def exists(p): return os.path.exists(p)

# 1. Namespace faltante
if "Namespace not specified" in log and exists(APP_GRADLE):
    c = read(APP_GRADLE); m = re.search(r'applicationId\s*=\s*"([^"]+)"', c)
    if m and "namespace =" not in c:
        write(APP_GRADLE, c.replace("android {", f'android {{\n    namespace = "{m.group(1)}"', 1))
        applied.append("namespace faltante agregado")

# 2. OOM / Metaspace del daemon
if ("OutOfMemoryError" in log or "Metaspace" in log) and exists(GRADLE_PROPS):
    c = read(GRADLE_PROPS)
    if "Xmx2048m" in c:
        write(GRADLE_PROPS, c.replace("Xmx2048m", "Xmx4096m")); applied.append("memoria de Gradle aumentada a 4096m")
    elif "org.gradle.jvmargs" not in c:
        write(GRADLE_PROPS, c + "\norg.gradle.jvmargs=-Xmx4096m\n"); applied.append("jvmargs agregado")

# 3. Kotlin incompatible con Gradle
if "is only compatible with Gradle" in log and exists(ROOT_GRADLE):
    c = read(ROOT_GRADLE)
    nc = re.sub(r'org\.jetbrains\.kotlin\.android"\)\s+version\s+"[^"]+"', 'org.jetbrains.kotlin.android") version "1.9.24"', c)
    if nc != c: write(ROOT_GRADLE, nc); applied.append("Kotlin actualizado a 1.9.24")

# 4. AGP incompatible
if "requires Android Gradle plugin" in log and exists(ROOT_GRADLE):
    c = read(ROOT_GRADLE)
    nc = re.sub(r'com\.android\.application"\)\s+version\s+"[^"]+"', 'com.android.application") version "8.3.2"', c)
    if nc != c: write(ROOT_GRADLE, nc); applied.append("AGP actualizado a 8.3.2")

# 5. Dependencia no resuelta -> bajar a version conocida estable
m = re.search(r"Failed to resolve:\s*([\w\.\-:]+)", log)
if m and exists(APP_GRADLE):
    dep = m.group(1); c = read(APP_GRADLE)
    if dep in c:
        base = ":".join(dep.split(":")[:-1]); write(APP_GRADLE, re.sub(re.escape(dep), base + ":1.12.0", c))
        applied.append(f"version ajustada: {dep}")

# 6. Falta repositorio google()/mavenCentral()
if "Could not find" in log and "google()" in log.lower() and exists(SETTINGS):
    c = read(SETTINGS)
    if "google()" not in c:
        c = c.replace("repositories {", "repositories {\n        google()\n        mavenCentral()", 1)
        write(SETTINGS, c); applied.append("repositorios google()/mavenCentral() agregados")

# 7. minSdk incompatible con una dependencia
m = re.search(r"uses-sdk:minSdkVersion (\d+) cannot be smaller than version (\d+)", log)
if m and exists(APP_GRADLE):
    required = m.group(2); c = read(APP_GRADLE)
    nc = re.sub(r'minSdk\s*=\s*\d+', f'minSdk = {required}', c)
    if nc != c: write(APP_GRADLE, nc); applied.append(f"minSdk actualizado a {required}")

# 8. compileSdk demasiado bajo para el AGP
if "compileSdkVersion" in log and "is too low" in log and exists(APP_GRADLE):
    c = read(APP_GRADLE)
    nc = re.sub(r'compileSdk\s*=\s*\d+', 'compileSdk = 34', c)
    if nc != c: write(APP_GRADLE, nc); applied.append("compileSdk actualizado a 34")

# 9. Falta permiso de Internet (para apps que usan red)
if ("UnknownHostException" in log or "Permission denied" in log and "INTERNET" in log) and exists(MANIFEST):
    c = read(MANIFEST)
    if "android.permission.INTERNET" not in c:
        c = c.replace("<manifest", '<manifest xmlns:tools="http://schemas.android.com/tools"', 1) if "xmlns:tools" not in c else c
        c = c.replace("<application", '<uses-permission android:name="android.permission.INTERNET" />\n    <application', 1)
        write(MANIFEST, c); applied.append("permiso INTERNET agregado al manifest")

# 10. Duplicate class / duplicado de dependencias
if "Duplicate class" in log and exists(APP_GRADLE):
    c = read(APP_GRADLE)
    if "exclude(group" not in c:
        c = re.sub(r'(dependencies \{)', r'\1\n    configurations.all {\n        exclude(group = "com.google.guava", module = "listenablefuture")\n    }', c, count=1)
        write(APP_GRADLE, c); applied.append("exclusion de dependencia duplicada aplicada")

# 11. JVM target mismatch entre Java y Kotlin
if "inconsistent JVM-target" in log and exists(APP_GRADLE):
    c = read(APP_GRADLE)
    c = re.sub(r'sourceCompatibility\s*=\s*JavaVersion\.\w+', 'sourceCompatibility = JavaVersion.VERSION_17', c)
    c = re.sub(r'targetCompatibility\s*=\s*JavaVersion\.\w+', 'targetCompatibility = JavaVersion.VERSION_17', c)
    c = re.sub(r'jvmTarget\s*=\s*"[^"]+"', 'jvmTarget = "17"', c)
    write(APP_GRADLE, c); applied.append("JVM target unificado a 17")

# 12. Falta google-services.json / plugin mal aplicado (evita fallo duro, remueve referencia rota)
if "google-services.json is missing" in log and exists(APP_GRADLE):
    c = read(APP_GRADLE)
    nc = c.replace('id("com.google.gms.google-services")\n', '')
    if nc != c: write(APP_GRADLE, nc); applied.append("plugin google-services removido (json faltante)")

# 13. Recurso duplicado / valores XML mal formados -> normaliza strings.xml si existe backup roto
if "error: Duplicate resources" in log:
    for f in glob.glob("app/src/main/res/**/strings.xml", recursive=True):
        c = read(f)
        seen = set(); lines = []
        for line in c.splitlines():
            m2 = re.search(r'name="([^"]+)"', line)
            if m2 and m2.group(1) in seen:
                continue
            if m2: seen.add(m2.group(1))
            lines.append(line)
        write(f, "\n".join(lines))
    applied.append("recursos duplicados en strings.xml limpiados")

# 14. Version catalog / typo en plugin id conocido
if "Plugin with id" in log and "not found" in log and exists(ROOT_GRADLE):
    fixes = {
        'id("com.android.aplication")': 'id("com.android.application")',
        'id("org.jetbrains.kotlin.andriod")': 'id("org.jetbrains.kotlin.android")',
    }
    c = read(ROOT_GRADLE)
    for wrong, right in fixes.items():
        if wrong in c:
            c = c.replace(wrong, right); applied.append(f"typo de plugin corregido: {wrong} -> {right}")
    write(ROOT_GRADLE, c)

# 15. Timeout de red al descargar dependencias -> agrega reintentos
if ("Read timed out" in log or "Connection timed out" in log) and exists(GRADLE_PROPS):
    c = read(GRADLE_PROPS)
    if "systemProp.http.socketTimeout" not in c:
        write(GRADLE_PROPS, c + "\nsystemProp.http.socketTimeout=60000\nsystemProp.http.connectionTimeout=60000\n")
        applied.append("timeouts de red aumentados en gradle.properties")

# 16. Falta declarar buildFeatures.compose cuando se usa Compose
if "Compose Compiler requires" in log and exists(APP_GRADLE):
    c = read(APP_GRADLE)
    if "buildFeatures" not in c:
        c = c.replace("android {", 'android {\n    buildFeatures {\n        compose = true\n    }', 1)
        write(APP_GRADLE, c); applied.append("buildFeatures.compose habilitado")

# 17. applicationId con caracteres invalidos
if "applicationId" in log and "is not a valid Java package name" in log and exists(APP_GRADLE):
    c = read(APP_GRADLE)
    m3 = re.search(r'applicationId\s*=\s*"([^"]+)"', c)
    if m3:
        cleaned = re.sub(r'[^a-zA-Z0-9\.]', '', m3.group(1))
        write(APP_GRADLE, c.replace(m3.group(1), cleaned)); applied.append("applicationId invalido saneado")

# 18. Kotlin daemon crash aislado -> forzar sin daemon como fallback (se aplica en gradle.properties)
if "Daemon" in log and "crashed" in log and exists(GRADLE_PROPS):
    c = read(GRADLE_PROPS)
    if "org.gradle.daemon" not in c:
        write(GRADLE_PROPS, c + "\norg.gradle.daemon=false\n"); applied.append("daemon de Gradle deshabilitado tras crash")

# 19. R8/minify fallando en debug (no debería estar activo)
if "R8" in log and "debug" in log.lower() and exists(APP_GRADLE):
    c = read(APP_GRADLE)
    nc = re.sub(r'(debug\s*\{)([^}]*)isMinifyEnabled\s*=\s*true', r'\1\2isMinifyEnabled = false', c)
    if nc != c: write(APP_GRADLE, nc); applied.append("minify deshabilitado en build debug")

# 20. Espacio en disco del runner agotado -> limpiar caches en el propio job (marca para el workflow)
if "No space left on device" in log:
    applied.append("__CLEAN_DISK__")  # señal especial que el workflow interpreta

with open("fixes_applied.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(applied) if applied else "")

if applied:
    print("Reparaciones aplicadas:"); [print(" -", a) for a in applied]
    sys.exit(0)
else:
    print("Sin regla de reparacion conocida para este error."); sys.exit(2)
