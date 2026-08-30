// V-CORE SENTINEL // Motor de Persistencia Local IndexedDB
export const dbEngine = {
  dbName: "VCoreSentinelDB",
  dbVersion: 1,

  initDB: function() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = (e) => reject("Error al abrir IndexedDB: " + e.target.errorCode);
      request.onsuccess = (e) => resolve(e.target.result);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("expedientes")) {
          db.createObjectStore("expedientes", { keyPath: "vin" });
        }
      };
    });
  },

  guardarExpediente: async function(expediente) {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["expedientes"], "readwrite");
      const store = tx.objectStore("expedientes");
      const req = store.put(expediente);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  obtenerExpediente: async function(vin) {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["expedientes"], "readonly");
      const store = tx.objectStore("expedientes");
      const req = store.get(vin);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }
};
