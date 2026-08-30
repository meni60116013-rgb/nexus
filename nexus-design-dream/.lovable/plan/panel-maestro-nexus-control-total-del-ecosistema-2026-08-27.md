# Panel maestro NEXUS — control total del ecosistema

Objetivo: un panel de administración exclusivo tuyo, protegido por un **Tokenmaster** que tú generas, con biometría, y con control de clientes, tokens, pagos, actualizaciones y mantenimiento.

## Estado actual verificado

- Ya existen `/admin` y `/admin/` con métricas y tablas de talleres, pagos y suscripciones.
- La base ya tiene: `profiles` (con `is_admin`), `planes`, `pagos_admin`, `suscripciones_taller`, además de `clientes`, `vehiculos`, `ordenes_trabajo`, `piezas`, `orden_piezas`.
- El acceso admin hoy depende de `profiles.is_admin`, una columna en la misma tabla que edita el usuario: eso permite escalada de privilegios. Se corrige en este plan.

## 1. Blindaje del acceso (obligatorio)

- Tabla separada `user_roles` (`admin`, `soporte`, `taller`) + función `has_role()` de seguridad. `profiles.is_admin` deja de decidir nada.
- **Tokenmaster**: tú lo generas una sola vez desde una pantalla de arranque. Solo se guarda su hash (SHA-256 + salt) en la base; el valor en claro se muestra una única vez para que lo copies. Sin ese token, `/admin` no abre aunque la sesión sea de administrador.
- Sesión admin corta (30 min) que exige revalidar Tokenmaster; botón "cerrar bóveda" inmediato.
- Rotación y revocación del Tokenmaster desde el propio panel.

## 2. Biometría

- **Segundo factor real**: passkey WebAuthn con el sensor del dispositivo (Face ID / rostro Android / huella). Es reconocimiento facial verificado por el hardware, resistente a fotos y video, y es lo que se usa para desbloquear el panel.
- **VCORE Bio (rostro + voz por cámara/micrófono)**: pantalla de verificación con captura de rostro y frase de voz, registrada en la auditoría. Se implementa como capa visual/de registro, **no** como el candado principal, porque un modelo de rostro/voz en navegador se engaña con una grabación. El candado es Tokenmaster + passkey.

## 3. Tokens automáticos para clientes

Nueva tabla `tokens_cliente`:

- Generación automática al dar de alta un taller y bajo demanda desde el panel.
- Tipos: acceso, licencia, activación de equipo, invitación de técnico.
- Campos: token (solo hash + prefijo visible), taller, tipo, plan asociado, límite de dispositivos, vigencia, estado (activo / suspendido / revocado / expirado), usos.
- Acciones: generar, copiar una vez, renovar, revocar en masa, ver historial de uso.
- El taller queda bloqueado si su token está revocado o expirado.

## 4. Pagos y suscripciones

- Gestión de `planes` (alta, precio, periodo, activo).
- Registro y edición de pagos en `pagos_admin`: marcar pagado / pendiente / fallido, folio, método, notas.
- Suscripciones: alta, cambio de plan, próximo cobro, suspender o reactivar taller.
- Estado de cartera: ingresos del mes, morosos, próximos vencimientos.
- Cobro real (Stripe) queda fuera de este alcance; se registra manual/administrativo. Se puede añadir después.

## 5. Actualizaciones

- Tabla `actualizaciones`: versión, canal (estable/beta), notas, obligatoria sí/no, fecha de publicación, talleres destino.
- El taller ve un aviso de nueva versión; si es obligatoria, se bloquea hasta confirmar.

## 6. Mantenimiento

- Tabla `mantenimiento`: modo global o por taller, mensaje, ventana de inicio/fin.
- Con mantenimiento activo, `/app` muestra pantalla de servicio en lugar del panel del taller.

## 7. Auditoría

- Tabla `admin_auditoria`: cada acción del panel (token generado/revocado, pago editado, taller suspendido, entrada al panel, verificación biométrica) con actor, IP y fecha. Solo lectura, visible en el panel.

## Detalles técnicos

- Migración SQL con `GRANT` + RLS en cada tabla nueva: lectura/escritura solo para `has_role(auth.uid(),'admin')`; el taller solo lee lo suyo (su suscripción, su aviso de actualización, mantenimiento).
- Los tokens y el Tokenmaster se generan y verifican en el servidor con `createServerFn` (hash en base, valor en claro nunca almacenado ni registrado).
- Rutas nuevas: `/admin/bloqueo` (Tokenmaster + biometría), `/admin/tokens`, `/admin/pagos`, `/admin/actualizaciones`, `/admin/mantenimiento`, `/admin/auditoria`, con `/admin` como layout protegido.
- El primer administrador (tu cuenta) se asigna en la migración por correo; dímelo o lo dejo para asignar desde la pantalla de arranque del Tokenmaster.
- Estilo consistente con el tema industrial carbón/ámbar existente.
