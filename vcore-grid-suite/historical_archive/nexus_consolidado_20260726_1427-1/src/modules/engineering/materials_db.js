/**
 * Suite Vcore Nexus - Base de Datos Técnica de Materiales Industriales
 */
const VCORE_MATERIALS_DB = {
    "CHROMOLY_4130": {
        name: "Cromoly 4130 (Acero Aleado)",
        density: 7.85, // g/cm³
        yieldStrength: 460, // MPa
        tensileStrength: 560, // MPa
        elasticModulus: 205, // GPa
        weldability: "EXCELENTE (TIG recomendado con precalentamiento según espesor)",
        applications: "Chasis de alta competición, subchasis ligeros, jaulas de seguridad"
    },
    "STEEL_1020": {
        name: "Acero al Carbono 1020",
        density: 7.87, // g/cm³
        yieldStrength: 295, // MPa
        tensileStrength: 395, // MPa
        elasticModulus: 200, // GPa
        weldability: "EXCELENTE (MIG/TIG/Electrodo)",
        applications: "Chasis comerciales de serie, soportes generales, basculantes estándar"
    },
    "STEEL_1018": {
        name: "Acero al Carbono 1018",
        density: 7.87, // g/cm³
        yieldStrength: 370, // MPa
        tensileStrength: 440, // MPa
        elasticModulus: 205, // GPa
        weldability: "EXCELENTE (MIG/TIG)",
        applications: "Bujes, pernos, placas de montaje, bujes de suspensión"
    },
    "ALUMINUM_6061_T6": {
        name: "Aluminio 6061-T6",
        density: 2.70, // g/cm³
        yieldStrength: 276, // MPa
        tensileStrength: 310, // MPa
        elasticModulus: 68.9, // GPa
        weldability: "BUENA (Requiere TIG AC y tratamiento térmico posterior)",
        applications: "Subchasis ultraligeros, pletinas, soportes de posapiés, tijeras"
    }
};

if (typeof module !== 'undefined') module.exports = VCORE_MATERIALS_DB;
