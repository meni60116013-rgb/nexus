import { jsPDF } from 'jspdf';
import { LICENSE_INFO } from './security.js';

export function generateTechnicalPDF(params, metrics) {
  const doc = new jsPDF();

  // Encabezado
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(16);
  doc.text('SUITE V-CORE SENTINEL - HOJA TÉCNICA CAD', 10, 18);

  // Datos de Registro
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Identificador Único: ${LICENSE_INFO.buildHash}`, 10, 40);
  doc.text(`Autor / Propietario: ${LICENSE_INFO.owner}`, 10, 46);
  doc.text(`Fecha de Registro: ${new Date().toLocaleDateString()}`, 10, 52);

  doc.setLineWidth(0.5);
  doc.line(10, 56, 200, 56);

  // ESPECIFICACIONES DE GEOMETRÍA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. PARÁMETROS DE GEOMETRÍA', 10, 66);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`- Grosor del Tubo: ${params.tubeRadius * 1000} mm`, 15, 74);
  doc.text(`- Altura de Dirección: ${params.headstockHeight} m`, 15, 80);
  doc.text(`- Ancho de Pivote: ${params.pivotWidth} m`, 15, 86);
  doc.text(`- Largo del Chasis: ${params.chassisLength} m`, 15, 92);

  // ANÁLISIS MECÁNICO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. CÁLCULO ESTRUCTURAL Y MATERIALES', 10, 106);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`- Material Seleccionado: ${metrics.materialName}`, 15, 114);
  doc.text(`- Peso Estimado: ${metrics.weightKg} kg`, 15, 120);
  doc.text(`- Resistencia Torsional Máxima: ${metrics.maxTorqueNm} kNm`, 15, 126);
  doc.text(`- Factor de Seguridad Estructural: ${metrics.safetyFactor}`, 15, 132);

  // PIE DE PÁGINA / SEGURIDAD
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Documento generado automáticamente por V-Core Sentinel Engine.', 10, 280);
  doc.text('Propiedad Intelectual Reservada. Prohibida la reproducción no autorizada.', 10, 285);

  doc.save(`Ficha_Tecnica_Chasis_${LICENSE_INFO.buildHash}.pdf`);
}
