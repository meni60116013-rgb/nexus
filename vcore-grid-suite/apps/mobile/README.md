# Hidden Signal — Scanner de dispositivos ocultos (proyecto standalone)

Independiente de todo el ecosistema VCORE Nexus. Sin sincronizar a ningún
repo, backup local en Drive, ni nombre compartido — este es su propio
proyecto, empieza limpio.

## Qué hace hoy (v0.1.0, este código)

- Escanea Bluetooth Low Energy y WiFi cercanos en tiempo real
- Dibuja cada dispositivo en un radar animado (posición = RSSI + hash de
  dirección MAC, para que no salte de lugar entre refrescos)
- Guarda todo en una base local (Room/SQLite): historial completo +
  lista blanca de dispositivos conocidos
- Verde = dispositivo que ya marcaste como conocido. Naranja = desconocido
- Corre como servicio en primer plano para no perder detecciones al
  minimizar la app
- Pide los permisos correctos para Android 12+ (BLUETOOTH_SCAN sin
  requerir ubicación cuando es posible, POST_NOTIFICATIONS, etc.)

## Qué se agregó en esta sesión (v0.2.0)

1. **Alertas activas** — `FollowDetector` agrupa los avistamientos de un
   mismo dispositivo desconocido en "ráfagas" separadas por ≥15 min de
   silencio; si detecta 3+ ráfagas en la ventana analizada, `AlertNotifier`
   dispara una notificación de alta prioridad ("dispositivo sospechoso
   cerca de ti"). Corre dentro de `ScanForegroundService`, en cada detección.
2. **Ícono y splash reales** — ícono adaptativo con el motivo de radar
   (anillos naranjas sobre fondo oscuro, consistente con la app), pantalla
   de splash animada al abrir (vía `core-splashscreen`).
3. **Onboarding** — `OnboardingActivity` es ahora la pantalla de entrada:
   explica en lenguaje simple por qué se piden permisos de ubicación/
   Bluetooth/notificaciones antes de que el sistema los pida de verdad.
   Solo se muestra la primera vez (usa `SharedPreferences`).
4. **Exportar historial** — botón en la pantalla de Historial que genera
   un CSV (`HistoryExporter`) con todos los dispositivos y abre el
   selector de "Compartir" de Android (WhatsApp, correo, Drive, etc.).

## Qué falta todavía

- Probar en un dispositivo/emulador real — el código está completo y
  estructurado correctamente pero no se compiló aquí (sin Android SDK
  ni red en este entorno); es esperable ajustar detalles menores al
  correrlo por primera vez
- Afinar los umbrales de `FollowDetector` (15 min de silencio / 3 ráfagas)
  probando en el mundo real — hoy son valores razonables de partida, no
  calibrados con datos reales
- Ícono en PNG de mayor resolución para Play Store (hoy es vector, sirve
  para el ícono de la app pero Play Store pide además un PNG de 512x512)

## Cómo abrirlo

1. Descarga y descomprime `HiddenSignal.zip`
2. Ábrelo con Android Studio (File → Open → selecciona la carpeta)
3. Deja que sincronice Gradle
4. Conecta un celular o usa un emulador y dale Run

## Estructura

```
app/src/main/java/com/hiddensignal/scanner/
  data/   → Room: DeviceEntity, DAO, base de datos, repositorio
  scan/   → BleScanner, WifiScanner, servicio en primer plano
  ui/     → MainActivity (radar), WhitelistActivity, HistoryActivity, RadarView
```

Package: `com.hiddensignal.scanner` — nombre nuevo, sin nada de `vcore`,
para que quede completamente separado de los otros repos.
