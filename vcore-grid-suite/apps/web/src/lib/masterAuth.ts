// Módulo de Autenticación de Emergencia / Token Maestro
export const MASTER_ADMIN_KEY = "VCORE-MASTER-ADMIN-KEY-2026-NEXUS-UNLIMITED-ROOT";

export function checkMasterAccess(userEmail?: string, masterTokenInput?: string): boolean {
  // Validación de SuperAdmin por Correo Oficial
  if (userEmail === "meni60116013-rgb@gmail.com") {
    return true;
  }
  // Validación por Token Maestro Físico
  if (masterTokenInput && masterTokenInput === MASTER_ADMIN_KEY) {
    return true;
  }
  return false;
}
