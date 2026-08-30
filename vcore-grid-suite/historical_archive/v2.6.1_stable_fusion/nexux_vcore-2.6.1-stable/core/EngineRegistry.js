export class EngineRegistry {
  static engines = new Map();
  
  static register(name, engineFn) {
    this.engines.set(name, engineFn);
  }

  static execute(name, payload) {
    if (!this.engines.has(name)) {
      throw new Error(`[V-CORE ERROR] El motor '${name}' no está registrado.`);
    }
    return this.engines.get(name)(payload);
  }

  static listEngines() {
    return Array.from(this.engines.keys());
  }
}
