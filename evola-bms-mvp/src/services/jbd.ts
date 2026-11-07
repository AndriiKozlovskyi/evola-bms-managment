import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';
import type { BleDevice } from '@capacitor-community/bluetooth-le';

// Standard JBD/Xiaoxiang UART-over-BLE profile; some BMS variants use a different profile.
const BASE = '-0000-1000-8000-00805f9b34fb';
const SERVICE = `0000ff00${BASE}`;
const NOTIFY = `0000ff01${BASE}`;
const WRITE = `0000ff02${BASE}`;

export interface BmsData {
  voltage: number | null;
  current: number | null;
  soc: number | null;
  temperatures: number[];
  cells: number[];
  updatedAt: number | null;
}

export const emptyBmsData = (): BmsData => ({
  voltage: null, current: null, soc: null, temperatures: [], cells: [], updatedAt: null,
});

interface PendingResponse {
  resolve(payload: Uint8Array): void;
  reject(error: Error): void;
  timeout: ReturnType<typeof setTimeout>;
}

function readCommand(register: number): DataView {
  const checksum = (-register) & 0xffff;
  return numbersToDataView([0xdd, 0xa5, register, 0, checksum >> 8, checksum & 0xff, 0x77]);
}

function writeCommand(register: number, payload: number[]): DataView {
  const checksum = (-(register + payload.length + payload.reduce((sum, byte) => sum + byte, 0))) & 0xffff;
  return numbersToDataView([
    0xdd, 0x5a, register, payload.length, ...payload,
    checksum >> 8, checksum & 0xff, 0x77,
  ]);
}

function wordPayload(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

class FrameAssembler {
  private pending: number[] = [];
  constructor(private readonly onFrame: (register: number, status: number, payload: Uint8Array) => void) {}
  reset() { this.pending = []; }
  push(fragment: DataView) {
    for (const byte of new Uint8Array(fragment.buffer, fragment.byteOffset, fragment.byteLength)) this.pending.push(byte);
    while (this.pending.length) {
      const start = this.pending.indexOf(0xdd);
      if (start < 0) { this.pending = []; return; }
      if (start > 0) this.pending.splice(0, start);
      if (this.pending.length < 4) return;
      const length = this.pending[3];
      const total = length + 7;
      if (total > 263) { this.pending.shift(); continue; }
      if (this.pending.length < total) return;
      const frame = this.pending.slice(0, total);
      if (frame[total - 1] !== 0x77) { this.pending.shift(); continue; }
      // RX checksum is two's complement of status + length + payload.
      const sum = frame.slice(2, total - 3).reduce((acc, n) => acc + n, 0);
      const checksum = (-sum) & 0xffff;
      const actual = (frame[total - 3] << 8) | frame[total - 2];
      this.pending.splice(0, total);
      if (checksum !== actual) continue;
      this.onFrame(frame[1], frame[2], Uint8Array.from(frame.slice(4, 4 + length)));
    }
  }
}

export class JbdClient {
  public deviceId: string | null = null;
  public readonly data: BmsData = emptyBmsData();
  private readonly responseWaiters = new Map<number, PendingResponse>();
  private assembler = new FrameAssembler((register, status, payload) => this.handleFrame(register, status, payload));
  private timer: ReturnType<typeof setInterval> | undefined;
  private busy = false;
  private onUpdate: (data: BmsData) => void;
  private onDisconnected: () => void;
  constructor(onUpdate: (data: BmsData) => void, onDisconnected: () => void) {
    this.onUpdate = onUpdate;
    this.onDisconnected = onDisconnected;
  }
  async connect(selectedDevice?: BleDevice): Promise<string> {
    await BleClient.initialize();
    const device = selectedDevice ?? await BleClient.requestDevice({ services: [SERVICE] });
    this.deviceId = device.deviceId;
    try {
      await BleClient.connect(device.deviceId, () => this.handleDisconnect());
      await BleClient.startNotifications(device.deviceId, SERVICE, NOTIFY, value => this.assembler.push(value));
      // A single request of each type first, then a 2-second polling cycle.
      await this.poll();
      this.timer = setInterval(() => { void this.poll(); }, 2000);
    } catch (error) {
      await this.disconnect();
      throw error;
    }
    return device.name || device.deviceId;
  }
  async disconnect() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    const id = this.deviceId;
    this.deviceId = null;
    this.rejectPending(new Error('Bluetooth device disconnected.'));
    this.assembler.reset();
    if (id) {
      try { await BleClient.stopNotifications(id, SERVICE, NOTIFY); } catch { /* ignore */ }
      try { await BleClient.disconnect(id); } catch { /* ignore */ }
    }
  }
  private handleDisconnect() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.deviceId = null;
    this.rejectPending(new Error('Bluetooth device disconnected.'));
    this.assembler.reset();
    this.onDisconnected();
  }
  async readConfigRegisters(registers: number[]): Promise<Record<number, number>> {
    return this.withFactoryMode(false, async () => {
      const values: Record<number, number> = {};
      for (const register of [...new Set(registers)]) {
        const payload = await this.transact(register, readCommand(register));
        if (payload.length < 2) throw new Error(`Register 0x${register.toString(16)} returned no value.`);
        values[register] = (payload[0] << 8) | payload[1];
      }
      return values;
    });
  }
  async writeConfigRegisters(entries: Array<[number, number]>): Promise<void> {
    for (const [register, value] of entries) {
      if (!Number.isInteger(value) || value < 0 || value > 0xffff) {
        throw new Error(`Register 0x${register.toString(16)} value must be an unsigned 16-bit integer.`);
      }
    }
    await this.withFactoryMode(true, async () => {
      for (const [register, value] of entries) {
        await this.transact(register, writeCommand(register, wordPayload(value)));
      }
    });
  }
  private async withFactoryMode<T>(commit: boolean, action: () => Promise<T>): Promise<T> {
    const id = this.deviceId;
    if (!id) throw new Error('Connect to a BMS before accessing settings.');
    const resumePolling = Boolean(this.timer);
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    while (this.busy) await new Promise(resolve => setTimeout(resolve, 25));
    if (this.deviceId !== id) throw new Error('Bluetooth device disconnected.');
    this.busy = true;
    let enteredFactoryMode = false;
    try {
      await this.transact(0x00, writeCommand(0x00, [0x56, 0x78]));
      enteredFactoryMode = true;
      const result = await action();
      await this.transact(0x01, writeCommand(0x01, commit ? [0x28, 0x28] : [0x00, 0x00]));
      enteredFactoryMode = false;
      return result;
    } catch (error) {
      if (enteredFactoryMode && this.deviceId === id) {
        try { await this.transact(0x01, writeCommand(0x01, [0x00, 0x00])); } catch { /* preserve the original error */ }
      }
      throw error;
    } finally {
      this.busy = false;
      if (resumePolling && this.deviceId === id) {
        this.timer = setInterval(() => { void this.poll(); }, 2000);
      }
    }
  }
  private transact(register: number, command: DataView): Promise<Uint8Array> {
    const id = this.deviceId;
    if (!id) return Promise.reject(new Error('Connect to a BMS before sending commands.'));
    if (this.responseWaiters.has(register)) return Promise.reject(new Error(`A request for register 0x${register.toString(16)} is already pending.`));
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responseWaiters.delete(register);
        reject(new Error(`Timed out waiting for BMS register 0x${register.toString(16)}.`));
      }, 4000);
      this.responseWaiters.set(register, { resolve, reject, timeout });
      void BleClient.write(id, SERVICE, WRITE, command).catch(error => {
        const pending = this.responseWaiters.get(register);
        if (!pending) return;
        this.responseWaiters.delete(register);
        clearTimeout(pending.timeout);
        pending.reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }
  private handleFrame(register: number, status: number, payload: Uint8Array) {
    const pending = this.responseWaiters.get(register);
    if (pending) {
      this.responseWaiters.delete(register);
      clearTimeout(pending.timeout);
      if (status === 0) pending.resolve(payload);
      else pending.reject(new Error(`BMS rejected register 0x${register.toString(16)} (status 0x${status.toString(16)}).`));
      return;
    }
    if (status === 0) this.parse(register, payload);
  }
  private rejectPending(error: Error) {
    for (const pending of this.responseWaiters.values()) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.responseWaiters.clear();
  }
  private async poll() {
    if (!this.deviceId || this.busy) return;
    this.busy = true;
    try {
      const id = this.deviceId;
      await BleClient.write(id, SERVICE, WRITE, readCommand(3));
      await new Promise(resolve => setTimeout(resolve, 350));
      if (this.deviceId !== id) return;
      await BleClient.write(id, SERVICE, WRITE, readCommand(4));
    } finally { this.busy = false; }
  }
  private parse(register: number, payload: Uint8Array) {
    const v = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
    if (register === 3 && payload.length >= 23) {
      this.data.voltage = v.getUint16(0, false) / 100;
      this.data.current = v.getInt16(2, false) / 100;
      this.data.soc = v.getUint8(19);
      const count = v.getUint8(22);
      this.data.temperatures = [];
      for (let i = 0; i < count && 25 + i * 2 <= payload.length; i++) {
        this.data.temperatures.push((v.getUint16(23 + i * 2, false) - 2731) / 10);
      }
    } else if (register === 4 && payload.length >= 2) {
      this.data.cells = [];
      for (let i = 0; i + 1 < payload.length; i += 2) {
        this.data.cells.push(v.getUint16(i, false) / 1000);
      }
    } else return;
    this.data.updatedAt = Date.now();
    this.onUpdate({ ...this.data, cells: [...this.data.cells], temperatures: [...this.data.temperatures] });
  }
}
