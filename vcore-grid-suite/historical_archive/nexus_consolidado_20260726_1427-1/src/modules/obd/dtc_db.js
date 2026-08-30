/**
 * Suite Vcore Nexus - Base de Datos Offline de Códigos DTC Universales y Motocicletas
 */
const VCORE_DTC_DATABASE = {
    "P0105": { code: "P0105", system: "Admisión / Sensor MAP", desc: "Falla en el circuito del Sensor de Presión Absoluta del Múltiple.", cause: "Manguera de vacío suelta, cableado defectuoso o sensor MAP dañado." },
    "P0115": { code: "P0115", system: "Refrigeración / Sensor ECT", desc: "Falla en el circuito de Temperatura del Refrigerante del Motor.", cause: "Sensor ECT en cortocircuito, termostato pegado o bajo nivel de anticongelante." },
    "P0120": { code: "P0120", system: "Inyección / Sensor TPS", desc: "Mal funcionamiento en el circuito del Sensor de Posición de Mariposa.", cause: "Pista interna del TPS desgastada, descalibración del cuerpo de aceleración o falso contacto." },
    "P0201": { code: "P0201", system: "Combustible / Inyector 1", desc: "Circuito del inyector del Cilindro 1 abierto o en cortocircuito.", cause: "Inyector tapado/quemado, arnés desconectado o fallo en etapa de potencia de la ECU." },
    "P0300": { code: "P0300", system: "Encendido / Chispa", desc: "Fallo de encendido aleatorio detectado en múltiples cilindros.", cause: "Bujía desgastada, bobina de encendido con fuga de alto voltaje, baja compresión o gasolina contaminada." },
    "P0505": { code: "P0505", system: "Ralentí / Válvula IAC", desc: "Falla en el sistema de control de marcha mínima (IAC / Stepper Motor).", cause: "Cuerpo de aceleración sucio con carbón, válvula IAC atascada o fuga de aire en admisión." },
    "P0560": { code: "P0560", system: "Eléctrico / Batería", desc: "Tensión de alimentación del sistema / ECU fuera de rango.", cause: "Regulador de voltaje defectuoso, estátor en corto o batería al final de su vida útil." },
    "P0600": { code: "P0600", system: "Comunicación / Bus CAN", desc: "Falla en el enlace de comunicación del bus CAN / Enlace Serie.", cause: "Resistencia de terminación dañada, interferencia electromagnética o cable de datos cortado." }
};

if (typeof module !== 'undefined') module.exports = VCORE_DTC_DATABASE;
