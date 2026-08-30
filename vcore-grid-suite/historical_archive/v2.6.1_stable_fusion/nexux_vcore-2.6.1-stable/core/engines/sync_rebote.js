export default class ThinClientMirror {
  constructor() {
    this.localChannel = new BroadcastChannel('vcore_mirror_channel');
    this.ultimoTimestamp = 0;
    this.origenDispositivo = /Android|iPhone/i.test(navigator.userAgent) ? 'MOBILE' : 'DESKTOP';
  }

  async solicitarComputoNube(modulo, payload) {
    try {
      const res = await fetch('/api/vcore-compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo, payload })
      });
      const data = await res.json();
      this.rebotarAEstadoRemoto(modulo, data);
      return data;
    } catch (err) {
      console.error('Error al solicitar cómputo nube:', err);
    }
  }

  async rebotarAEstadoRemoto(modulo, data) {
    const paquete = {
      origen: this.origenDispositivo,
      modulo,
      data,
      timestamp: Date.now()
    };
    
    // Difusión Local
    this.localChannel.postMessage(paquete);

    // Relevo Nube para la PC o Celular remoto
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paquete)
      });
    } catch (e) {
      console.error('Error en relevo remoto:', e);
    }
  }

  iniciarEscuchaRemota(callback) {
    // Escucha local
    this.localChannel.onmessage = (e) => callback(e.data);

    // Polling ligero (1.5s) para reflejo entre dispositivos distintos
    setInterval(async () => {
      try {
        const res = await fetch('/api/sync');
        const estado = await res.json();
        if (estado.timestamp && estado.timestamp > this.ultimoTimestamp && estado.origen !== this.origenDispositivo) {
          this.ultimoTimestamp = estado.timestamp;
          callback(estado);
        }
      } catch (e) {}
    }, 1500);
  }
}
