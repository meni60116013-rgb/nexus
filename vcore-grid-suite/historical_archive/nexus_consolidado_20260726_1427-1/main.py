# -*- coding: utf-8 -*-
# PROYECTO: V-core Nexux
# AUTOR: Manuel de Jesús Ovalle Carrillo
# PROTECCIÓN: Propiedad Intelectual (2026)
# ==========================================

import os
import sys
import time

def limpiar_pantalla():
    os.system('clear')

def mostrar_menu():
    limpiar_pantalla()
    print("====================================================")
    print("        V-CORE NEXUX - ESPACIO DE TRABAJO           ")
    print("        AUTOR: Manuel de Jesús Ovalle Carrillo      ")
    print("====================================================")
    print("\n[ Entorno Activo y Automatizado ]\n")
    print("1) Monitorear Telemetría / OBD-II")
    print("2) Módulos de Cálculo (Chasis / Factor K)")
    print("3) Seguridad / Protocolo Kill-Switch")
    print("4) Pausar Entorno (Salir al Terminal)")
    print("====================================================")

def main():
    while True:
        mostrar_menu()
        try:
            opcion = input("\nSeleccione una opción o deje en pausa: ")
            if opcion == '1':
                print("\n[PROCESO] Iniciando simulación de telemetría...")
                time.sleep(2)
            elif opcion == '2':
                print("\n[PROCESO] Cargando herramientas de diseño estructural...")
                time.sleep(2)
            elif opcion == '3':
                print("\n[ALERTA] Accediendo a protocolos de seguridad...")
                time.sleep(2)
            elif opcion == '4':
                print("\n[INFO] Pausando espacio de trabajo. Volviendo a Termux...")
                break
            else:
                print("\n[ERROR] Opción no válida.")
                time.sleep(1.5)
        except KeyboardInterrupt:
            print("\n\n[INFO] Entorno pausado correctamente.")
            break

if __name__ == "__main__":
    main()
