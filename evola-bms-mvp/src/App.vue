<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { BleClient } from '@capacitor-community/bluetooth-le';
import type { BleDevice } from '@capacitor-community/bluetooth-le';
import {
  BatteryFull,
  BluetoothConnected,
  BluetoothSearching,
  CircleCheck,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  X,
} from '@lucide/vue';
import { JbdClient, emptyBmsData } from './services/jbd';
import { BMS_CONFIG } from './services/bmsConfig';
import { mockBmsData } from './services/mockBms';
import {
  CONFIG_REGISTERS,
  LEVEL2_CURRENT_DELAY_MS,
  LEVEL2_CURRENT_MILLIVOLTS,
  LEVEL3_CURRENT_DELAY_US,
  LEVEL3_CURRENT_MILLIVOLTS,
  MOCK_BMS_SETTINGS,
  changedSettingKeys,
  decodeBmsSettings,
  encodeBmsSettings,
  validateBmsSettings,
  type BooleanSettingKey,
  type BmsSettings,
  type EditableSettingKey,
  type NumericSettingKey,
} from './services/jbdSettings';

type Tab = 'devices' | 'home' | 'settings';
interface DiscoveredDevice extends BleDevice {
  name: string;
  rssi?: number;
}
interface ProtectionRow {
  label: string;
  triggerKey: NumericSettingKey;
  releaseKey: NumericSettingKey;
  delayKey: NumericSettingKey;
  triggerUnit: string;
  releaseUnit: string;
  delayUnit: string;
}

const protectionRows: ProtectionRow[] = [
  { label: 'Заряд: перегрев', triggerKey: 'chargeOverTempTriggerC', releaseKey: 'chargeOverTempReleaseC', delayKey: 'chargeOverTempDelaySeconds', triggerUnit: '°C', releaseUnit: '°C', delayUnit: 'с' },
  { label: 'Заряд: низкая температура', triggerKey: 'chargeUnderTempTriggerC', releaseKey: 'chargeUnderTempReleaseC', delayKey: 'chargeUnderTempDelaySeconds', triggerUnit: '°C', releaseUnit: '°C', delayUnit: 'с' },
  { label: 'Разряд: перегрев', triggerKey: 'dischargeOverTempTriggerC', releaseKey: 'dischargeOverTempReleaseC', delayKey: 'dischargeOverTempDelaySeconds', triggerUnit: '°C', releaseUnit: '°C', delayUnit: 'с' },
  { label: 'Разряд: низкая температура', triggerKey: 'dischargeUnderTempTriggerC', releaseKey: 'dischargeUnderTempReleaseC', delayKey: 'dischargeUnderTempDelaySeconds', triggerUnit: '°C', releaseUnit: '°C', delayUnit: 'с' },
  { label: 'Батарея: перенапряжение', triggerKey: 'packOverVoltageTriggerMv', releaseKey: 'packOverVoltageReleaseMv', delayKey: 'packOverVoltageDelaySeconds', triggerUnit: 'мВ', releaseUnit: 'мВ', delayUnit: 'с' },
  { label: 'Батарея: низкое напряжение', triggerKey: 'packUnderVoltageTriggerMv', releaseKey: 'packUnderVoltageReleaseMv', delayKey: 'packUnderVoltageDelaySeconds', triggerUnit: 'мВ', releaseUnit: 'мВ', delayUnit: 'с' },
  { label: 'Ячейка: перенапряжение', triggerKey: 'cellOverVoltageTriggerMv', releaseKey: 'cellFullVoltageMv', delayKey: 'cellOverVoltageDelaySeconds', triggerUnit: 'мВ', releaseUnit: 'мВ', delayUnit: 'с' },
  { label: 'Ячейка: низкое напряжение', triggerKey: 'cellUnderVoltageTriggerMv', releaseKey: 'cellMinVoltageMv', delayKey: 'cellUnderVoltageDelaySeconds', triggerUnit: 'мВ', releaseUnit: 'мВ', delayUnit: 'с' },
  { label: 'Заряд: сверхток', triggerKey: 'chargeOverCurrentMa', releaseKey: 'chargeOverCurrentReleaseSeconds', delayKey: 'chargeOverCurrentTriggerDelaySeconds', triggerUnit: 'мА', releaseUnit: 'с', delayUnit: 'с' },
  { label: 'Разряд: сверхток', triggerKey: 'dischargeOverCurrentMa', releaseKey: 'dischargeOverCurrentReleaseSeconds', delayKey: 'dischargeOverCurrentTriggerDelaySeconds', triggerUnit: 'мА', releaseUnit: 'с', delayUnit: 'с' },
];
const ntcFields: Array<{ key: BooleanSettingKey; label: string }> = [
  { key: 'ntc1Enabled', label: 'NTC 1' },
  { key: 'ntc2Enabled', label: 'NTC 2' },
  { key: 'ntc3Enabled', label: 'NTC 3' },
  { key: 'ntc4Enabled', label: 'NTC 4' },
  { key: 'ntc5Enabled', label: 'NTC 5' },
  { key: 'ntc6Enabled', label: 'NTC 6' },
  { key: 'ntc7Enabled', label: 'NTC 7' },
  { key: 'ntc8Enabled', label: 'NTC 8' },
];

const DEMO_DEVICE_NAME = 'Демо BMS · 13S';
const data = ref(mockBmsData());
const connected = ref(false);
const connecting = ref(false);
const deviceName = ref(DEMO_DEVICE_NAME);
const error = ref('');
const activeTab = ref<Tab>('home');
const devices = ref<DiscoveredDevice[]>([]);
const scanning = ref(false);
const settings = ref<BmsSettings>({ ...MOCK_BMS_SETTINGS });
const savedSettings = ref<BmsSettings>({ ...MOCK_BMS_SETTINGS });
const settingsLoaded = ref(false);
const settingsLoading = ref(false);
const settingsSaving = ref(false);
const showSaveConfirmation = ref(false);
const settingsError = ref('');
const settingsMessage = ref('Демо-настройки: подключитесь к BMS, чтобы прочитать текущие значения.');
const client = new JbdClient(
  next => { data.value = next; },
  () => {
    connected.value = false;
    deviceName.value = DEMO_DEVICE_NAME;
    data.value = mockBmsData();
    settingsLoaded.value = false;
  },
);
const cellRange = computed(() => {
  if (!data.value.cells.length) return null;
  return {
    min: Math.min(...data.value.cells),
    max: Math.max(...data.value.cells),
  };
});
const delta = computed(() => cellRange.value
  ? Math.round((cellRange.value.max - cellRange.value.min) * 1000) : null);
function cellBarWidth(voltage: number) {
  const { min, max } = BMS_CONFIG.cellVoltage;
  return Math.max(0, Math.min(100, ((voltage - min) / (max - min)) * 100));
}
const dirtyKeys = computed(() => changedSettingKeys(settings.value, savedSettings.value));
const settingsValid = computed(() => validateBmsSettings(settings.value));
const level2CurrentOptions = computed(() => LEVEL2_CURRENT_MILLIVOLTS.map((millivolts, code) => ({
  code,
  label: currentThresholdLabel(millivolts),
})));
const level3CurrentOptions = computed(() => LEVEL3_CURRENT_MILLIVOLTS.map((millivolts, code) => ({
  code,
  label: currentThresholdLabel(millivolts),
})));
const level2DelayOptions = LEVEL2_CURRENT_DELAY_MS.map((milliseconds, code) => ({ code, label: `${milliseconds} мс` }));
const level3DelayOptions = LEVEL3_CURRENT_DELAY_US.map((microseconds, code) => ({ code, label: `${microseconds} мкс` }));
function isDirty(key: EditableSettingKey) {
  return dirtyKeys.value.includes(key);
}
function updateNumber(key: NumericSettingKey, event: Event) {
  settings.value[key] = (event.target as HTMLInputElement).valueAsNumber;
}
function updateToggle(key: BooleanSettingKey, event: Event) {
  settings.value[key] = (event.target as HTMLInputElement).checked;
}
function currentThresholdLabel(millivolts: number) {
  const shunt = settings.value.shuntResistanceRaw;
  if (!shunt) return `${millivolts} мВ`;
  const doubled = settings.value.level3ShortCircuitDouble ? 2 : 1;
  return `${Math.round((millivolts * 10 / shunt) * doubled)} А`;
}
function errorText(value: unknown) {
  const message = value instanceof Error ? value.message : String(value);
  if (message.includes('navigator.bluetooth.requestLEScan is not a function')) {
    return 'Непрерывный BLE-поиск недоступен в этом браузере. Запустите приложение на Android для поиска устройств.';
  }
  return message;
}
async function startScan() {
  error.value = '';
  devices.value = [];
  try {
    await BleClient.initialize();
    await BleClient.requestLEScan({}, result => {
      const entry: DiscoveredDevice = {
        ...result.device,
        name: result.localName || result.device.name || 'Устройство без имени',
        rssi: result.rssi,
      };
      const index = devices.value.findIndex(device => device.deviceId === entry.deviceId);
      if (index === -1) devices.value.push(entry);
      else devices.value[index] = entry;
    });
    scanning.value = true;
  } catch (e) {
    scanning.value = false;
    error.value = errorText(e);
  }
}
async function stopScan() {
  if (!scanning.value) return;
  try { await BleClient.stopLEScan(); }
  catch (e) { error.value = errorText(e); }
  finally { scanning.value = false; }
}
async function readSettingsFromBms() {
  const registers = await client.readConfigRegisters(CONFIG_REGISTERS);
  return decodeBmsSettings(registers);
}
async function loadSettings() {
  if (!connected.value || settingsLoading.value) return;
  settingsLoading.value = true;
  settingsError.value = '';
  try {
    const loaded = await readSettingsFromBms();
    settings.value = { ...loaded };
    savedSettings.value = { ...loaded };
    settingsLoaded.value = true;
    settingsMessage.value = `Настройки прочитаны: ${deviceName.value}`;
  } catch (e) {
    settingsLoaded.value = false;
    settingsError.value = errorText(e);
    settingsMessage.value = 'Не удалось прочитать конфигурацию BMS.';
  } finally {
    settingsLoading.value = false;
  }
}
async function connectDevice(device?: DiscoveredDevice) {
  error.value = '';
  await stopScan();
  connecting.value = true;
  try {
    deviceName.value = await client.connect(device);
    connected.value = true;
    activeTab.value = 'home';
    await loadSettings();
  } catch (e) { error.value = errorText(e); }
  finally { connecting.value = false; }
}
async function disconnectDevice() {
  await client.disconnect();
  connected.value = false;
  deviceName.value = DEMO_DEVICE_NAME;
  data.value = emptyBmsData();
  settingsLoaded.value = false;
}
async function toggle() {
  if (connected.value) await disconnectDevice();
  else await connectDevice();
}
function requestSave() {
  settingsError.value = settingsValid.value.join(' ');
  if (!settingsLoaded.value || !connected.value || dirtyKeys.value.length === 0 || settingsError.value) return;
  showSaveConfirmation.value = true;
}
async function saveSettings() {
  showSaveConfirmation.value = false;
  settingsSaving.value = true;
  settingsError.value = '';
  const changed = [...dirtyKeys.value];
  const writes = encodeBmsSettings(settings.value, savedSettings.value, changed);
  try {
    await client.writeConfigRegisters(writes);
    try {
      const verified = await readSettingsFromBms();
      settings.value = { ...verified };
      savedSettings.value = { ...verified };
      settingsMessage.value = 'Изменения записаны и проверены.';
    } catch (e) {
      savedSettings.value = { ...settings.value };
      settingsError.value = `Запись подтверждена BMS, но повторное чтение не удалось: ${errorText(e)}`;
      settingsMessage.value = 'Запись подтверждена; проверьте значения повторным чтением.';
    }
  } catch (e) {
    settingsError.value = errorText(e);
  } finally {
    settingsSaving.value = false;
  }
}
onUnmounted(() => {
  void stopScan();
  void client.disconnect();
});
const val = (n: number | null, digits = 1) => n === null ? '—' : n.toFixed(digits);
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <div>
        <p class="eyebrow">EVOLA / BATTERY MANAGEMENT</p>
        <h1>{{ activeTab === 'devices' ? 'Устройства' : activeTab === 'settings' ? 'Настройки' : 'Батарея' }}</h1>
      </div>
      <span :class="['connection-state', connected ? 'is-connected' : 'is-demo']">
        <span class="state-dot" />{{ connected ? 'Подключено' : 'Демо-режим' }}
      </span>
    </header>

    <p v-if="error" class="notice notice-error" role="alert">{{ error }}</p>

    <section v-if="activeTab === 'devices'" class="screen devices-screen">
      <div class="section-toolbar">
        <div>
          <h2>Bluetooth LE</h2>
          <p>Найдите BMS поблизости и подключитесь к ней.</p>
        </div>
        <button class="icon-button scan-button" :disabled="connecting" :aria-label="scanning ? 'Остановить поиск' : 'Начать поиск'" @click="scanning ? stopScan() : startScan()">
          <X v-if="scanning" :size="18" />
          <BluetoothSearching v-else :size="18" />
        </button>
      </div>
      <p v-if="scanning" class="scan-state"><span class="state-dot is-pulsing" />Поиск устройств…</p>
      <div v-if="connected" class="device-row current-device">
        <div class="device-glyph"><BluetoothConnected :size="20" /></div>
        <div class="device-copy"><strong>{{ deviceName }}</strong><small>Текущее подключение</small></div>
        <CircleCheck class="device-check" :size="18" />
      </div>
      <div v-for="device in devices" :key="device.deviceId" class="device-row">
        <div class="device-glyph"><BluetoothConnected :size="20" /></div>
        <div class="device-copy"><strong>{{ device.name }}</strong><small>{{ device.rssi === undefined ? 'BLE устройство' : `Сигнал ${device.rssi} dBm` }}</small></div>
        <button class="text-action" :disabled="connecting || device.deviceId === client.deviceId" @click="connectDevice(device)">
          {{ device.deviceId === client.deviceId ? 'Подключено' : connecting ? 'Подключение…' : 'Подключить' }}
        </button>
      </div>
      <div v-if="!devices.length && !scanning" class="empty-state">
        <Search :size="24" />
        <p>Пока нет найденных устройств</p>
      </div>
      <button v-if="connected" class="secondary-action disconnect-action" @click="disconnectDevice">Отключить {{ deviceName }}</button>
    </section>

    <section v-else-if="activeTab === 'home'" class="screen home-screen">
      <section class="charge-section">
        <p class="section-kicker">ОСТАТОК ЗАРЯДА</p>
        <div class="soc">{{ data.soc === null ? '—' : data.soc }}<span>%</span></div>
        <div class="progress"><div :style="{ width: `${data.soc ?? 0}%` }" /></div>
        <div class="hero-readings">
          <div><small>Напряжение</small><strong>{{ val(data.voltage, 2) }} <span>В</span></strong></div>
          <div><small>Ток</small><strong>{{ val(data.current, 2) }} <span>А</span></strong></div>
        </div>
        <div class="device-caption"><span class="state-dot" />{{ deviceName }}</div>
      </section>
      <div class="home-toolbar">
        <p>{{ data.updatedAt ? `Обновлено ${new Date(data.updatedAt).toLocaleTimeString()}` : 'Ожидание показаний' }}</p>
        <button v-if="connected" class="text-action" @click="disconnectDevice">Отключиться</button>
        <button v-else class="text-action" @click="activeTab = 'devices'">Найти BMS</button>
      </div>
      <section class="data-section temperature-section">
        <h2>Температура</h2>
        <div v-if="data.temperatures.length" class="temperature-list">
          <div v-for="(temperature, i) in data.temperatures" :key="i" class="temperature-row">
            <span class="temperature-icon" aria-hidden="true">🌡</span>
            <span>Датчик {{ i + 1 }}</span>
            <strong>{{ val(temperature, 1) }} °C</strong>
          </div>
        </div>
        <p v-else class="empty">Нет данных</p>
      </section>
      <section class="data-section cells-section">
        <div class="panelhead">
          <h2>Напряжение секций</h2>
          <div class="cell-summary"><small>Min {{ BMS_CONFIG.cellVoltage.min.toFixed(3) }} В</small><small>Max {{ BMS_CONFIG.cellVoltage.max.toFixed(3) }} В</small><small>Δ {{ delta ?? '—' }} мВ</small></div>
        </div>
        <div v-if="data.cells.length" class="cells">
          <div v-for="(voltage, i) in data.cells" :key="i" class="cell-item">
            <small>#{{ i + 1 }}</small>
            <div class="cell-bar" role="meter" :aria-label="`Секция ${i + 1}: ${val(voltage, 3)} В`" :aria-valuemin="BMS_CONFIG.cellVoltage.min" :aria-valuemax="BMS_CONFIG.cellVoltage.max" :aria-valuenow="voltage">
              <span aria-hidden="true" :style="{ width: `${cellBarWidth(voltage)}%` }" />
              <strong>{{ val(voltage, 3) }} В</strong>
            </div>
          </div>
        </div>
        <p v-else class="empty">Нет данных</p>
      </section>
    </section>

    <section v-else class="screen settings-screen">
      <div class="section-toolbar settings-toolbar">
        <div>
          <h2>Конфигурация BMS</h2>
          <p>{{ settingsMessage }}</p>
        </div>
        <button class="icon-button" :disabled="!connected || settingsLoading || settingsSaving" aria-label="Прочитать настройки" @click="loadSettings">
          <RefreshCw :size="17" :class="{ spinning: settingsLoading }" />
        </button>
      </div>
      <p v-if="settingsError" class="notice notice-error" role="alert">{{ settingsError }}</p>
      <p v-if="!connected" class="notice notice-demo">Демо-поля можно менять для просмотра. Запись включится после подключения и чтения конфигурации.</p>

      <section class="settings-group">
        <h3>Конфигурация емкости</h3>
        <label class="setting-row" :class="{ changed: isDirty('cellCount') }"><span>Количество ячеек</span><span class="setting-control"><input v-model.number="settings.cellCount" type="number" min="1" max="32" step="1"><small>шт.</small></span></label>
        <label class="setting-row" :class="{ changed: isDirty('totalBatteryCapacityMah') }"><span>Емкость батареи</span><span class="setting-control"><input v-model.number="settings.totalBatteryCapacityMah" type="number" min="10" step="10"><small>мА·ч</small></span></label>
        <label class="setting-row" :class="{ changed: isDirty('totalCycleCapacityMah') }"><span>Циклическая емкость</span><span class="setting-control"><input v-model.number="settings.totalCycleCapacityMah" type="number" min="10" step="10"><small>мА·ч</small></span></label>
        <label class="setting-row" :class="{ changed: isDirty('cellFullVoltageMv') }"><span>Полное напряжение ячейки</span><span class="setting-control"><input v-model.number="settings.cellFullVoltageMv" type="number" min="1000" max="5000" step="1"><small>мВ</small></span></label>
        <label class="setting-row" :class="{ changed: isDirty('cellMinVoltageMv') }"><span>Минимальное напряжение</span><span class="setting-control"><input v-model.number="settings.cellMinVoltageMv" type="number" min="1000" max="5000" step="1"><small>мВ</small></span></label>
        <label class="setting-row" :class="{ changed: isDirty('cellSelfDischargePercent') }"><span>Саморазряд ячейки</span><span class="setting-control"><input v-model.number="settings.cellSelfDischargePercent" type="number" min="0" max="6553.5" step="0.1"><small>%</small></span></label>
      </section>

      <section class="settings-group">
        <h3>Напряжение оценки емкости</h3>
        <label class="setting-row" :class="{ changed: isDirty('capacity100Mv') }"><span>100% емкости</span><span class="setting-control"><input v-model.number="settings.capacity100Mv" type="number" min="1000" max="5000"><small>мВ</small></span></label>
        <div class="setting-row unsupported"><span>90% емкости</span><span class="unsupported-value">Не поддерживается</span></div>
        <label class="setting-row" :class="{ changed: isDirty('capacity80Mv') }"><span>80% емкости</span><span class="setting-control"><input v-model.number="settings.capacity80Mv" type="number" min="1000" max="5000"><small>мВ</small></span></label>
        <div class="setting-row unsupported"><span>70% емкости</span><span class="unsupported-value">Не поддерживается</span></div>
        <label class="setting-row" :class="{ changed: isDirty('capacity60Mv') }"><span>60% емкости</span><span class="setting-control"><input v-model.number="settings.capacity60Mv" type="number" min="1000" max="5000"><small>мВ</small></span></label>
        <div class="setting-row unsupported"><span>50% емкости</span><span class="unsupported-value">Не поддерживается</span></div>
        <label class="setting-row" :class="{ changed: isDirty('capacity40Mv') }"><span>40% емкости</span><span class="setting-control"><input v-model.number="settings.capacity40Mv" type="number" min="1000" max="5000"><small>мВ</small></span></label>
        <div class="setting-row unsupported"><span>30% емкости</span><span class="unsupported-value">Не поддерживается</span></div>
        <label class="setting-row" :class="{ changed: isDirty('capacity20Mv') }"><span>20% емкости</span><span class="setting-control"><input v-model.number="settings.capacity20Mv" type="number" min="1000" max="5000"><small>мВ</small></span></label>
        <div class="setting-row unsupported"><span>10% емкости</span><span class="unsupported-value">Не поддерживается</span></div>
        <label class="setting-row" :class="{ changed: isDirty('capacity0Mv') }"><span>0% емкости</span><span class="setting-control"><input v-model.number="settings.capacity0Mv" type="number" min="1000" max="5000"><small>мВ</small></span></label>
        <p class="settings-note">В проверенной карте стандартного JBD доступны точки 100/80/60/40/20/0%. Остальные точки видны в интерфейсе, но их регистры зависят от модели и не записываются.</p>
      </section>

      <section class="settings-group">
        <h3>Балансир</h3>
        <label class="setting-row" :class="{ changed: isDirty('balanceStartVoltageMv') }"><span>Напряжение запуска</span><span class="setting-control"><input v-model.number="settings.balanceStartVoltageMv" type="number" min="1000" max="5000"><small>мВ</small></span></label>
        <label class="setting-row" :class="{ changed: isDirty('deltaToBalanceMv') }"><span>Разница для баланса</span><span class="setting-control"><input v-model.number="settings.deltaToBalanceMv" type="number" min="0" max="1000"><small>мВ</small></span></label>
        <label class="setting-toggle" :class="{ changed: isDirty('balancerEnabled') }"><span>Балансир включен</span><input v-model="settings.balancerEnabled" type="checkbox"><span class="toggle-track" /></label>
        <label class="setting-toggle" :class="{ changed: isDirty('balanceOnlyWhenCharging') }"><span>Только при зарядке</span><input v-model="settings.balanceOnlyWhenCharging" type="checkbox"><span class="toggle-track" /></label>
      </section>

      <section class="settings-group">
        <h3>Function Configuration</h3>
        <label class="setting-toggle" :class="{ changed: isDirty('switchCircuitEnabled') }"><span>SW switch circuit enable</span><input v-model="settings.switchCircuitEnabled" type="checkbox"><span class="toggle-track" /></label>
        <div class="setting-row unsupported"><span>Display Celsius</span><span class="unsupported-value">Неизвестный бит для этой модели</span></div>
      </section>

      <section class="settings-group">
        <h3>Защиты</h3>
        <div class="protection-table-wrap">
          <div class="protection-table">
            <div class="protection-columns"><span /><span>Условие срабатывания</span><span>Условие сброса</span><span>Задержка</span></div>
            <div v-for="row in protectionRows" :key="row.label" class="protection-row">
              <span class="protection-label">{{ row.label }}</span>
              <label class="protection-input protection-trigger" :class="{ changed: isDirty(row.triggerKey) }"><input type="number" :step="row.triggerUnit === '°C' ? 0.1 : 1" :value="settings[row.triggerKey]" @input="updateNumber(row.triggerKey, $event)"><small>{{ row.triggerUnit }}</small></label>
              <label class="protection-input protection-release" :class="{ changed: isDirty(row.releaseKey) }"><input type="number" :step="row.releaseUnit === '°C' ? 0.1 : 1" :value="settings[row.releaseKey]" @input="updateNumber(row.releaseKey, $event)"><small>{{ row.releaseUnit }}</small></label>
              <label class="protection-input protection-delay" :class="{ changed: isDirty(row.delayKey) }"><input type="number" min="0" max="255" :value="settings[row.delayKey]" @input="updateNumber(row.delayKey, $event)"><small>{{ row.delayUnit }}</small></label>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-group">
        <h3>Level 2 Protections</h3>
        <label class="setting-row" :class="{ changed: isDirty('level2OverCurrentCode') }"><span>Level 2 Overcurrent</span><span class="setting-control"><select v-model.number="settings.level2OverCurrentCode"><option v-for="option in level2CurrentOptions" :key="option.code" :value="option.code">{{ option.label }}</option></select></span></label>
        <label class="setting-row" :class="{ changed: isDirty('level2OverCurrentDelayCode') }"><span>Level 2 Overcurrent Delay</span><span class="setting-control"><select v-model.number="settings.level2OverCurrentDelayCode"><option v-for="option in level2DelayOptions" :key="option.code" :value="option.code">{{ option.label }}</option></select></span></label>
        <label class="setting-row" :class="{ changed: isDirty('level2OverVoltageMv') }"><span>Level 2 Overvoltage</span><span class="setting-control"><input v-model.number="settings.level2OverVoltageMv" type="number" min="1000" max="5000"><small>мВ</small></span></label>
        <label class="setting-row" :class="{ changed: isDirty('level2OverVoltageDelaySeconds') }"><span>Level 2 Overvoltage Delay</span><span class="setting-control"><select v-model.number="settings.level2OverVoltageDelaySeconds"><option v-for="seconds in [1, 2, 4, 8]" :key="seconds" :value="seconds">{{ seconds }} с</option></select></span></label>
        <label class="setting-row" :class="{ changed: isDirty('level2UnderVoltageMv') }"><span>Level 2 Undervoltage</span><span class="setting-control"><input v-model.number="settings.level2UnderVoltageMv" type="number" min="1000" max="5000"><small>мВ</small></span></label>
        <label class="setting-row" :class="{ changed: isDirty('level2UnderVoltageDelaySeconds') }"><span>Level 2 Undervoltage Delay</span><span class="setting-control"><select v-model.number="settings.level2UnderVoltageDelaySeconds"><option v-for="seconds in [1, 4, 8, 16]" :key="seconds" :value="seconds">{{ seconds }} с</option></select></span></label>
      </section>

      <section class="settings-group">
        <h3>Level 3 Protections</h3>
        <label class="setting-row" :class="{ changed: isDirty('level3ShortCircuitCode') }"><span>Level 3 Overcurrent (Short Circuit)</span><span class="setting-control"><select v-model.number="settings.level3ShortCircuitCode"><option v-for="option in level3CurrentOptions" :key="option.code" :value="option.code">{{ option.label }}</option></select></span></label>
        <label class="setting-row" :class="{ changed: isDirty('level3ShortCircuitDelayCode') }"><span>Level 3 Delay</span><span class="setting-control"><select v-model.number="settings.level3ShortCircuitDelayCode"><option v-for="option in level3DelayOptions" :key="option.code" :value="option.code">{{ option.label }}</option></select></span></label>
        <label class="setting-row" :class="{ changed: isDirty('level3ResetSeconds') }"><span>Reset Time</span><span class="setting-control"><input v-model.number="settings.level3ResetSeconds" type="number" min="0" max="255"><small>с</small></span></label>
      </section>

      <section class="settings-group">
        <h3>NTC enable</h3>
        <div class="ntc-grid">
          <label v-for="ntc in ntcFields" :key="ntc.key" class="setting-toggle ntc-toggle" :class="{ changed: isDirty(ntc.key) }">
            <span>{{ ntc.label }}</span><input type="checkbox" :checked="settings[ntc.key]" @change="updateToggle(ntc.key, $event)"><span class="toggle-track" />
          </label>
        </div>
      </section>

      <ul v-if="settingsError && settingsValid.length" class="validation-list">
        <li v-for="issue in settingsValid" :key="issue">{{ issue }}</li>
      </ul>
      <div class="save-bar">
        <span>{{ dirtyKeys.length ? `${dirtyKeys.length} изменено` : 'Нет изменений' }}</span>
        <button class="primary-action" :disabled="!connected || !settingsLoaded || !dirtyKeys.length || settingsValid.length > 0 || settingsSaving" @click="requestSave">
          <Save :size="16" />{{ settingsSaving ? 'Запись…' : 'Записать в BMS' }}
        </button>
      </div>
    </section>

    <nav class="bottom-tabs" aria-label="Основная навигация">
      <button :class="{ active: activeTab === 'devices' }" @click="activeTab = 'devices'"><BluetoothConnected :size="19" /><span>Устройства</span></button>
      <button :class="{ active: activeTab === 'home' }" @click="activeTab = 'home'"><BatteryFull :size="19" /><span>Главная</span></button>
      <button :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'"><SlidersHorizontal :size="19" /><span>Настройки</span></button>
    </nav>

    <div v-if="showSaveConfirmation" class="modal-backdrop" @click.self="showSaveConfirmation = false">
      <section class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="dialog-icon"><Save :size="20" /></div>
        <h2 id="confirm-title">Записать настройки?</h2>
        <p>Будет изменено параметров: {{ dirtyKeys.length }}. Проверьте значения для химии и конфигурации именно вашего аккумулятора. Сохранение заменит настройки BMS и сбросит счетчики ошибок.</p>
        <div class="dialog-actions">
          <button class="secondary-action" @click="showSaveConfirmation = false">Отмена</button>
          <button class="primary-action" :disabled="settingsSaving" @click="saveSettings"><Save :size="16" />Подтвердить запись</button>
        </div>
      </section>
    </div>
  </main>
</template>
