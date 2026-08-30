/**
 * Suite Vcore Nexus - Motor de Ficha Técnica y Expediente de Taller
 */
class FichaTecnicaManager {
    constructor(storageEngine) {
        this.db = storageEngine;
    }

    createBlankProfile() {
        return {
            id: null,
            brand: "",
            model: "",
            year: new Date().getFullYear(),
            engine: {
                type: "",
                displacementCc: 0,
                compressionRatio: "",
                maxPowerHp: 0
            },
            chassis: {
                type: "Tubular",
                material: "Acero al Carbono 1020",
                weightKg: 0
            },
            modificationsHistory: [],
            partsRegistry: [], // { partName, status: 'INSTALLED'|'REMOVED', date }
            images: []
        };
    }

    addModification(vehicleId, description, technicianNotes) {
        const vehicles = this.db.getAllVehicles();
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return false;

        vehicle.modificationsHistory.push({
            timestamp: new Date().toISOString(),
            description: description,
            notes: technicianNotes
        });

        this.db.saveVehicle(vehicle);
        return true;
    }

    addPartRecord(vehicleId, partName, action) {
        const vehicles = this.db.getAllVehicles();
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return false;

        vehicle.partsRegistry.push({
            timestamp: new Date().toISOString(),
            partName: partName,
            action: action // "INSTALADA" o "RETIRADA"
        });

        this.db.saveVehicle(vehicle);
        return true;
    }
}

if (typeof module !== 'undefined') module.exports = FichaTecnicaManager;
