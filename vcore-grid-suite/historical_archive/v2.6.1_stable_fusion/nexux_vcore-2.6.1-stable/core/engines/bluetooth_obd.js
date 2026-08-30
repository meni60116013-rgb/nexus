export default class BluetoothOBD {
  constructor() {
    this.device = null;
    this.server = null;
  }

  async conectarEscaner() {
    if (!navigator.bluetooth) {
      throw new Error('WebBluetooth no es compatible en este navegador.');
    }

    this.device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['00001101-0000-1000-8000-00805f9b34fb']
    });

    this.server = await this.device.gatt.connect();
    return this.device.name || 'Escáner OBD-II Conectado';
  }
}
