# -*- coding: utf-8 -*-
"""
V-CORE NEXUX - MOTOR DE CÁLCULO ESTRUCTURAL Y MECÁNICA DE CHASIS
Autor Intelectual: Manuel de Jesús Ovalle Carrillo
Contacto: meni60116013-rgb@gmail.com
Estatus: Propiedad Intelectual Protegida - Confidencial © 2026

Módulo matemático para la resolución geométrica de cuadros multitubulares.
Calcula el Factor K para deformación plástica y los ángulos de corte de inglete.
"""

import math

class ChassisMathSolver:
    def __init__(self):
        # Constante de proporcionalidad por defecto para acero estructural de cédula
        self.factor_k_predeterminado = 0.42

    def calcular_factor_k(self, radio_doblez, espesor_pared):
        """
        Calcula el Factor K real para el desarrollo plano del tubo.
        Fórmula: $K = \frac{R_{int}}{Espesor}$ adaptado al eje neutro.
        """
        if espesor_pared <= 0:
            return 0.0
        relacion = radio_doblez / espesor_pared
        if relacion < 2.0:
            return 0.33
        elif relacion < 4.0:
            return 0.42
        else:
            return 0.50

    def calcular_corte_inglete(self, angulo_interseccion_grados):
        """
        Determina el ángulo exacto del corte de sierra o esmeril (mitre cut)
        para el ensamble de dos tubos coplanares.
        """
        # El ángulo de corte es la mitad del ángulo complementario de unión
        angulo_corte = angulo_interseccion_grados / 2.0
        return round(angulo_corte, 2)

if __name__ == "__main__":
    print("--- V-CORE NEXUX: MOTOR MATEMÁTICO DE CHASIS ---")
    solver = ChassisMathSolver()
    
    # Simulación para tubo de 32mm de diámetro, 2mm de espesor, doblado a 45mm de radio
    k_res = solver.calcular_factor_k(45.0, 2.0)
    corte_res = solver.calcular_corte_inglete(90.0)
    
    print(f"[MATH] Factor K de Estiramiento Calculado: {k_res}")
    print(f"[MATH] Ángulo de Corte de Inglete para Escuadra (90°): {corte_res}°")
    print("-------------------------------------------------")
