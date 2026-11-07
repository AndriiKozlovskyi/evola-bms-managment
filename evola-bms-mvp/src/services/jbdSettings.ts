export interface BmsSettings {
  cellCount: number;
  totalBatteryCapacityMah: number;
  totalCycleCapacityMah: number;
  cellFullVoltageMv: number;
  cellMinVoltageMv: number;
  cellSelfDischargePercent: number;
  capacity100Mv: number;
  capacity80Mv: number;
  capacity60Mv: number;
  capacity40Mv: number;
  capacity20Mv: number;
  capacity0Mv: number;
  balanceStartVoltageMv: number;
  deltaToBalanceMv: number;
  balancerEnabled: boolean;
  balanceOnlyWhenCharging: boolean;
  switchCircuitEnabled: boolean;
  ntc1Enabled: boolean;
  ntc2Enabled: boolean;
  ntc3Enabled: boolean;
  ntc4Enabled: boolean;
  ntc5Enabled: boolean;
  ntc6Enabled: boolean;
  ntc7Enabled: boolean;
  ntc8Enabled: boolean;
  chargeOverTempTriggerC: number;
  chargeOverTempReleaseC: number;
  chargeUnderTempTriggerC: number;
  chargeUnderTempReleaseC: number;
  dischargeOverTempTriggerC: number;
  dischargeOverTempReleaseC: number;
  dischargeUnderTempTriggerC: number;
  dischargeUnderTempReleaseC: number;
  chargeOverTempDelaySeconds: number;
  chargeUnderTempDelaySeconds: number;
  dischargeOverTempDelaySeconds: number;
  dischargeUnderTempDelaySeconds: number;
  packOverVoltageTriggerMv: number;
  packOverVoltageReleaseMv: number;
  packUnderVoltageTriggerMv: number;
  packUnderVoltageReleaseMv: number;
  packOverVoltageDelaySeconds: number;
  packUnderVoltageDelaySeconds: number;
  cellOverVoltageTriggerMv: number;
  cellUnderVoltageTriggerMv: number;
  cellOverVoltageDelaySeconds: number;
  cellUnderVoltageDelaySeconds: number;
  chargeOverCurrentMa: number;
  dischargeOverCurrentMa: number;
  chargeOverCurrentTriggerDelaySeconds: number;
  chargeOverCurrentReleaseSeconds: number;
  dischargeOverCurrentTriggerDelaySeconds: number;
  dischargeOverCurrentReleaseSeconds: number;
  level2OverVoltageMv: number;
  level2UnderVoltageMv: number;
  level2OverVoltageDelaySeconds: number;
  level2UnderVoltageDelaySeconds: number;
  level2OverCurrentCode: number;
  level2OverCurrentDelayCode: number;
  level3ShortCircuitCode: number;
  level3ShortCircuitDelayCode: number;
  level3ShortCircuitDouble: boolean;
  level3ResetSeconds: number;
  functionConfigRaw: number;
  ntcConfigRaw: number;
  shuntResistanceRaw: number;
  secondaryProtectionRaw: number;
  level2DelayRaw: number;
}

export type EditableSettingKey = Exclude<keyof BmsSettings,
  | 'functionConfigRaw'
  | 'ntcConfigRaw'
  | 'shuntResistanceRaw'
  | 'secondaryProtectionRaw'
  | 'level2DelayRaw'>;
export type NumericSettingKey = {
  [Key in keyof BmsSettings]: BmsSettings[Key] extends number ? Key : never;
}[keyof BmsSettings] & EditableSettingKey;
export type BooleanSettingKey = {
  [Key in keyof BmsSettings]: BmsSettings[Key] extends boolean ? Key : never;
}[keyof BmsSettings] & EditableSettingKey;

export const EDITABLE_SETTING_KEYS: EditableSettingKey[] = [
  'cellCount',
  'totalBatteryCapacityMah',
  'totalCycleCapacityMah',
  'cellFullVoltageMv',
  'cellMinVoltageMv',
  'cellSelfDischargePercent',
  'capacity100Mv',
  'capacity80Mv',
  'capacity60Mv',
  'capacity40Mv',
  'capacity20Mv',
  'capacity0Mv',
  'balanceStartVoltageMv',
  'deltaToBalanceMv',
  'balancerEnabled',
  'balanceOnlyWhenCharging',
  'switchCircuitEnabled',
  'ntc1Enabled', 'ntc2Enabled', 'ntc3Enabled', 'ntc4Enabled',
  'ntc5Enabled', 'ntc6Enabled', 'ntc7Enabled', 'ntc8Enabled',
  'chargeOverTempTriggerC', 'chargeOverTempReleaseC',
  'chargeUnderTempTriggerC', 'chargeUnderTempReleaseC',
  'dischargeOverTempTriggerC', 'dischargeOverTempReleaseC',
  'dischargeUnderTempTriggerC', 'dischargeUnderTempReleaseC',
  'chargeOverTempDelaySeconds', 'chargeUnderTempDelaySeconds',
  'dischargeOverTempDelaySeconds', 'dischargeUnderTempDelaySeconds',
  'packOverVoltageTriggerMv', 'packOverVoltageReleaseMv',
  'packUnderVoltageTriggerMv', 'packUnderVoltageReleaseMv',
  'packOverVoltageDelaySeconds', 'packUnderVoltageDelaySeconds',
  'cellOverVoltageTriggerMv', 'cellUnderVoltageTriggerMv',
  'cellOverVoltageDelaySeconds', 'cellUnderVoltageDelaySeconds',
  'chargeOverCurrentMa', 'dischargeOverCurrentMa',
  'chargeOverCurrentTriggerDelaySeconds', 'chargeOverCurrentReleaseSeconds',
  'dischargeOverCurrentTriggerDelaySeconds', 'dischargeOverCurrentReleaseSeconds',
  'level2OverVoltageMv', 'level2UnderVoltageMv',
  'level2OverVoltageDelaySeconds', 'level2UnderVoltageDelaySeconds',
  'level2OverCurrentCode', 'level2OverCurrentDelayCode',
  'level3ShortCircuitCode', 'level3ShortCircuitDelayCode',
  'level3ShortCircuitDouble', 'level3ResetSeconds',
];

export const MOCK_BMS_SETTINGS: BmsSettings = {
  cellCount: 13,
  totalBatteryCapacityMah: 25000,
  totalCycleCapacityMah: 25000,
  cellFullVoltageMv: 4150,
  cellMinVoltageMv: 3000,
  cellSelfDischargePercent: 0.1,
  capacity100Mv: 4100,
  capacity80Mv: 3960,
  capacity60Mv: 3820,
  capacity40Mv: 3680,
  capacity20Mv: 3450,
  capacity0Mv: 3000,
  balanceStartVoltageMv: 3900,
  deltaToBalanceMv: 15,
  balancerEnabled: true,
  balanceOnlyWhenCharging: false,
  switchCircuitEnabled: false,
  ntc1Enabled: true,
  ntc2Enabled: true,
  ntc3Enabled: false,
  ntc4Enabled: false,
  ntc5Enabled: false,
  ntc6Enabled: false,
  ntc7Enabled: false,
  ntc8Enabled: false,
  chargeOverTempTriggerC: 55,
  chargeOverTempReleaseC: 45,
  chargeUnderTempTriggerC: 0,
  chargeUnderTempReleaseC: 1,
  dischargeOverTempTriggerC: 60,
  dischargeOverTempReleaseC: 50,
  dischargeUnderTempTriggerC: -20,
  dischargeUnderTempReleaseC: -10,
  chargeOverTempDelaySeconds: 5,
  chargeUnderTempDelaySeconds: 5,
  dischargeOverTempDelaySeconds: 5,
  dischargeUnderTempDelaySeconds: 5,
  packOverVoltageTriggerMv: 55250,
  packOverVoltageReleaseMv: 54600,
  packUnderVoltageTriggerMv: 39000,
  packUnderVoltageReleaseMv: 42000,
  packOverVoltageDelaySeconds: 2,
  packUnderVoltageDelaySeconds: 2,
  cellOverVoltageTriggerMv: 4250,
  cellUnderVoltageTriggerMv: 2800,
  cellOverVoltageDelaySeconds: 2,
  cellUnderVoltageDelaySeconds: 2,
  chargeOverCurrentMa: 60000,
  dischargeOverCurrentMa: -60000,
  chargeOverCurrentTriggerDelaySeconds: 10,
  chargeOverCurrentReleaseSeconds: 32,
  dischargeOverCurrentTriggerDelaySeconds: 10,
  dischargeOverCurrentReleaseSeconds: 32,
  level2OverVoltageMv: 4300,
  level2UnderVoltageMv: 2500,
  level2OverVoltageDelaySeconds: 8,
  level2UnderVoltageDelaySeconds: 16,
  level2OverCurrentCode: 4,
  level2OverCurrentDelayCode: 6,
  level3ShortCircuitCode: 6,
  level3ShortCircuitDelayCode: 1,
  level3ShortCircuitDouble: true,
  level3ResetSeconds: 5,
  functionConfigRaw: 0x0004,
  ntcConfigRaw: 0x0003,
  shuntResistanceRaw: 1,
  secondaryProtectionRaw: 0x8e6b,
  level2DelayRaw: 0xf005,
};

export const CONFIG_REGISTERS = [
  0x10, 0x11, 0x12, 0x13, 0x14,
  0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
  0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,
  0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
  0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
  0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f,
];

const REGISTER_FIELDS: Array<[EditableSettingKey, number, (value: number) => number]> = [
  ['cellCount', 0x2f, value => value],
  ['totalBatteryCapacityMah', 0x10, value => value],
  ['totalCycleCapacityMah', 0x11, value => value],
  ['cellFullVoltageMv', 0x25, value => value],
  ['cellMinVoltageMv', 0x27, value => value],
  ['cellSelfDischargePercent', 0x14, value => Math.round(value * 10)],
  ['capacity100Mv', 0x12, value => value],
  ['capacity80Mv', 0x32, value => value],
  ['capacity60Mv', 0x33, value => value],
  ['capacity40Mv', 0x34, value => value],
  ['capacity20Mv', 0x35, value => value],
  ['capacity0Mv', 0x13, value => value],
  ['balanceStartVoltageMv', 0x2a, value => value],
  ['deltaToBalanceMv', 0x2b, value => value],
  ['chargeOverTempTriggerC', 0x18, value => Math.round(value * 10 + 2731)],
  ['chargeOverTempReleaseC', 0x19, value => Math.round(value * 10 + 2731)],
  ['chargeUnderTempTriggerC', 0x1a, value => Math.round(value * 10 + 2731)],
  ['chargeUnderTempReleaseC', 0x1b, value => Math.round(value * 10 + 2731)],
  ['dischargeOverTempTriggerC', 0x1c, value => Math.round(value * 10 + 2731)],
  ['dischargeOverTempReleaseC', 0x1d, value => Math.round(value * 10 + 2731)],
  ['dischargeUnderTempTriggerC', 0x1e, value => Math.round(value * 10 + 2731)],
  ['dischargeUnderTempReleaseC', 0x1f, value => Math.round(value * 10 + 2731)],
  ['packOverVoltageTriggerMv', 0x20, value => Math.round(value / 10)],
  ['packOverVoltageReleaseMv', 0x21, value => Math.round(value / 10)],
  ['packUnderVoltageTriggerMv', 0x22, value => Math.round(value / 10)],
  ['packUnderVoltageReleaseMv', 0x23, value => Math.round(value / 10)],
  ['cellOverVoltageTriggerMv', 0x24, value => value],
  ['cellUnderVoltageTriggerMv', 0x26, value => value],
  ['chargeOverCurrentMa', 0x28, value => value],
  ['dischargeOverCurrentMa', 0x29, value => value],
  ['level2OverVoltageMv', 0x36, value => value],
  ['level2UnderVoltageMv', 0x37, value => value],
];

const NTC_KEYS = [
  'ntc1Enabled', 'ntc2Enabled', 'ntc3Enabled', 'ntc4Enabled',
  'ntc5Enabled', 'ntc6Enabled', 'ntc7Enabled', 'ntc8Enabled',
] as const;
const LEVEL2_OV_DELAY_CODES = [1, 2, 4, 8];
const LEVEL2_UV_DELAY_CODES = [1, 4, 8, 16];
export const LEVEL2_CURRENT_MILLIVOLTS = [8, 11, 14, 17, 19, 22, 25, 28, 31, 33, 36, 39, 42, 44, 47, 50];
export const LEVEL3_CURRENT_MILLIVOLTS = [22, 33, 44, 56, 67, 78, 89, 100];
export const LEVEL2_CURRENT_DELAY_MS = [8, 20, 40, 80, 160, 320, 640, 1280];
export const LEVEL3_CURRENT_DELAY_US = [70, 100, 200, 400];

function highByte(value: number) { return (value >> 8) & 0xff; }
function lowByte(value: number) { return value & 0xff; }
function signedWord(value: number) { return value > 0x7fff ? value - 0x10000 : value; }
function overVoltageDelayCode(seconds: number) { return LEVEL2_OV_DELAY_CODES.indexOf(seconds); }
function underVoltageDelayCode(seconds: number) { return LEVEL2_UV_DELAY_CODES.indexOf(seconds); }

export function decodeBmsSettings(registers: Record<number, number>): BmsSettings {
  const functionConfigRaw = registers[0x2d];
  const capacityUnitMah = functionConfigRaw & (1 << 12) ? 100 : 10;
  const temperatureDelays = registers[0x3a];
  const dischargeTemperatureDelays = registers[0x3b];
  const packVoltageDelays = registers[0x3c];
  const cellVoltageDelays = registers[0x3d];
  const chargeCurrentDelays = registers[0x3e];
  const dischargeCurrentDelays = registers[0x3f];
  const secondaryProtectionRaw = registers[0x38];
  const currentUnitMa = functionConfigRaw & (1 << 12) ? 100 : 10;
  const secondaryProtectionHigh = highByte(secondaryProtectionRaw);
  const secondaryProtectionLow = lowByte(secondaryProtectionRaw);
  const level2DelayRaw = registers[0x39];
  const level2DelayHigh = highByte(level2DelayRaw);
  const level2DelayLow = lowByte(level2DelayRaw);
  const ntcConfigRaw = registers[0x2e];
  const level2OverVoltageDelayCode = (level2DelayHigh >> 4) & 0x03;
  const level2UnderVoltageDelayCode = (level2DelayHigh >> 6) & 0x03;
  return {
    cellCount: registers[0x2f],
    totalBatteryCapacityMah: registers[0x10] * capacityUnitMah,
    totalCycleCapacityMah: registers[0x11] * capacityUnitMah,
    cellFullVoltageMv: registers[0x25],
    cellMinVoltageMv: registers[0x27],
    cellSelfDischargePercent: registers[0x14] / 10,
    capacity100Mv: registers[0x12],
    capacity80Mv: registers[0x32],
    capacity60Mv: registers[0x33],
    capacity40Mv: registers[0x34],
    capacity20Mv: registers[0x35],
    capacity0Mv: registers[0x13],
    balanceStartVoltageMv: registers[0x2a],
    deltaToBalanceMv: registers[0x2b],
    balancerEnabled: Boolean(functionConfigRaw & (1 << 2)),
    balanceOnlyWhenCharging: Boolean(functionConfigRaw & (1 << 3)),
    switchCircuitEnabled: Boolean(functionConfigRaw & (1 << 0)),
    ntc1Enabled: Boolean(ntcConfigRaw & (1 << 0)),
    ntc2Enabled: Boolean(ntcConfigRaw & (1 << 1)),
    ntc3Enabled: Boolean(ntcConfigRaw & (1 << 2)),
    ntc4Enabled: Boolean(ntcConfigRaw & (1 << 3)),
    ntc5Enabled: Boolean(ntcConfigRaw & (1 << 4)),
    ntc6Enabled: Boolean(ntcConfigRaw & (1 << 5)),
    ntc7Enabled: Boolean(ntcConfigRaw & (1 << 6)),
    ntc8Enabled: Boolean(ntcConfigRaw & (1 << 7)),
    chargeOverTempTriggerC: (registers[0x18] - 2731) / 10,
    chargeOverTempReleaseC: (registers[0x19] - 2731) / 10,
    chargeUnderTempTriggerC: (registers[0x1a] - 2731) / 10,
    chargeUnderTempReleaseC: (registers[0x1b] - 2731) / 10,
    dischargeOverTempTriggerC: (registers[0x1c] - 2731) / 10,
    dischargeOverTempReleaseC: (registers[0x1d] - 2731) / 10,
    dischargeUnderTempTriggerC: (registers[0x1e] - 2731) / 10,
    dischargeUnderTempReleaseC: (registers[0x1f] - 2731) / 10,
    chargeOverTempDelaySeconds: lowByte(temperatureDelays),
    chargeUnderTempDelaySeconds: highByte(temperatureDelays),
    dischargeOverTempDelaySeconds: lowByte(dischargeTemperatureDelays),
    dischargeUnderTempDelaySeconds: highByte(dischargeTemperatureDelays),
    packOverVoltageTriggerMv: registers[0x20] * 10,
    packOverVoltageReleaseMv: registers[0x21] * 10,
    packUnderVoltageTriggerMv: registers[0x22] * 10,
    packUnderVoltageReleaseMv: registers[0x23] * 10,
    packOverVoltageDelaySeconds: lowByte(packVoltageDelays),
    packUnderVoltageDelaySeconds: highByte(packVoltageDelays),
    cellOverVoltageTriggerMv: registers[0x24],
    cellUnderVoltageTriggerMv: registers[0x26],
    cellOverVoltageDelaySeconds: lowByte(cellVoltageDelays),
    cellUnderVoltageDelaySeconds: highByte(cellVoltageDelays),
    chargeOverCurrentMa: signedWord(registers[0x28]) * currentUnitMa,
    dischargeOverCurrentMa: signedWord(registers[0x29]) * currentUnitMa,
    chargeOverCurrentTriggerDelaySeconds: highByte(chargeCurrentDelays),
    chargeOverCurrentReleaseSeconds: lowByte(chargeCurrentDelays),
    dischargeOverCurrentTriggerDelaySeconds: highByte(dischargeCurrentDelays),
    dischargeOverCurrentReleaseSeconds: lowByte(dischargeCurrentDelays),
    level2OverVoltageMv: registers[0x36],
    level2UnderVoltageMv: registers[0x37],
    level2OverVoltageDelaySeconds: LEVEL2_OV_DELAY_CODES[level2OverVoltageDelayCode],
    level2UnderVoltageDelaySeconds: LEVEL2_UV_DELAY_CODES[level2UnderVoltageDelayCode],
    level2OverCurrentCode: secondaryProtectionLow & 0x0f,
    level2OverCurrentDelayCode: (secondaryProtectionLow >> 4) & 0x0f,
    level3ShortCircuitCode: secondaryProtectionHigh & 0x07,
    level3ShortCircuitDelayCode: (secondaryProtectionHigh >> 3) & 0x03,
    level3ShortCircuitDouble: Boolean(secondaryProtectionHigh & 0x80),
    level3ResetSeconds: level2DelayLow,
    functionConfigRaw,
    ntcConfigRaw,
    shuntResistanceRaw: registers[0x2c],
    secondaryProtectionRaw,
    level2DelayRaw,
  };
}

export function changedSettingKeys(current: BmsSettings, baseline: BmsSettings): EditableSettingKey[] {
  return EDITABLE_SETTING_KEYS.filter(key => current[key] !== baseline[key]);
}

export function validateBmsSettings(settings: BmsSettings): string[] {
  const errors: string[] = [];
  const capacityUnitMah = settings.functionConfigRaw & (1 << 12) ? 100 : 10;
  const integerFields: Array<[string, number]> = [
    ['Number of cells', settings.cellCount],
    ['Total battery capacity', settings.totalBatteryCapacityMah],
    ['Total cycle capacity', settings.totalCycleCapacityMah],
    ['Cell full voltage', settings.cellFullVoltageMv],
    ['Cell minimum voltage', settings.cellMinVoltageMv],
    ['100% capacity voltage', settings.capacity100Mv],
    ['80% capacity voltage', settings.capacity80Mv],
    ['60% capacity voltage', settings.capacity60Mv],
    ['40% capacity voltage', settings.capacity40Mv],
    ['20% capacity voltage', settings.capacity20Mv],
    ['0% capacity voltage', settings.capacity0Mv],
    ['Balancer start voltage', settings.balanceStartVoltageMv],
    ['Balancer delta', settings.deltaToBalanceMv],
    ['Charge overcurrent', settings.chargeOverCurrentMa],
    ['Discharge overcurrent', settings.dischargeOverCurrentMa],
    ['Pack overvoltage', settings.packOverVoltageTriggerMv],
    ['Pack overvoltage release', settings.packOverVoltageReleaseMv],
    ['Pack undervoltage', settings.packUnderVoltageTriggerMv],
    ['Pack undervoltage release', settings.packUnderVoltageReleaseMv],
    ['Cell overvoltage', settings.cellOverVoltageTriggerMv],
    ['Cell undervoltage', settings.cellUnderVoltageTriggerMv],
    ['Level 2 overvoltage', settings.level2OverVoltageMv],
    ['Level 2 undervoltage', settings.level2UnderVoltageMv],
    ['Level 3 reset time', settings.level3ResetSeconds],
  ];
  for (const [label, value] of integerFields) {
    if (!Number.isInteger(value)) errors.push(`${label} must be a whole number.`);
  }
  if (!Number.isFinite(settings.cellSelfDischargePercent) || settings.cellSelfDischargePercent < 0 || settings.cellSelfDischargePercent > 6553.5) {
    errors.push('Cell self-discharge must be between 0 and 6553.5%.');
  }
  if (settings.cellCount < 1 || settings.cellCount > 32) errors.push('Number of cells must be between 1 and 32.');
  if (settings.totalBatteryCapacityMah < capacityUnitMah || settings.totalBatteryCapacityMah > 655350 * (capacityUnitMah / 10) || settings.totalBatteryCapacityMah % capacityUnitMah !== 0) {
    errors.push(`Total battery capacity must use ${capacityUnitMah} mAh steps.`);
  }
  if (settings.totalCycleCapacityMah < capacityUnitMah || settings.totalCycleCapacityMah > 655350 * (capacityUnitMah / 10) || settings.totalCycleCapacityMah % capacityUnitMah !== 0) {
    errors.push(`Total cycle capacity must use ${capacityUnitMah} mAh steps.`);
  }
  if (settings.cellMinVoltageMv < 1000 || settings.cellMinVoltageMv > 5000) errors.push('Cell minimum voltage must be between 1000 and 5000 mV.');
  if (settings.cellFullVoltageMv < 1000 || settings.cellFullVoltageMv > 5000) errors.push('Cell full voltage must be between 1000 and 5000 mV.');
  if (settings.cellMinVoltageMv >= settings.cellFullVoltageMv) errors.push('Cell minimum voltage must be lower than cell full voltage.');
  const curve = [settings.capacity100Mv, settings.capacity80Mv, settings.capacity60Mv, settings.capacity40Mv, settings.capacity20Mv, settings.capacity0Mv];
  if (curve.some(value => value < 1000 || value > 5000)) errors.push('Capacity curve voltages must be between 1000 and 5000 mV.');
  if (curve.some((value, index) => index > 0 && value > curve[index - 1])) errors.push('Capacity curve voltages must not increase as capacity percentage decreases.');
  if (settings.balanceStartVoltageMv < 1000 || settings.balanceStartVoltageMv > 5000) errors.push('Balancer start voltage must be between 1000 and 5000 mV.');
  if (settings.deltaToBalanceMv < 0 || settings.deltaToBalanceMv > 1000) errors.push('Balancer delta must be between 0 and 1000 mV.');
  const temperatureSettings = [
    settings.chargeOverTempTriggerC, settings.chargeOverTempReleaseC,
    settings.chargeUnderTempTriggerC, settings.chargeUnderTempReleaseC,
    settings.dischargeOverTempTriggerC, settings.dischargeOverTempReleaseC,
    settings.dischargeUnderTempTriggerC, settings.dischargeUnderTempReleaseC,
  ];
  if (temperatureSettings.some(value => !Number.isFinite(value) || value < -40 || value > 125 || Math.round(value * 10) !== value * 10)) {
    errors.push('Protection temperatures must be between -40 and 125 °C in 0.1 °C steps.');
  }
  if (settings.chargeOverTempTriggerC <= settings.chargeOverTempReleaseC || settings.dischargeOverTempTriggerC <= settings.dischargeOverTempReleaseC) {
    errors.push('Overtemperature triggers must be higher than their release values.');
  }
  if (settings.chargeUnderTempTriggerC >= settings.chargeUnderTempReleaseC || settings.dischargeUnderTempTriggerC >= settings.dischargeUnderTempReleaseC) {
    errors.push('Undertemperature triggers must be lower than their release values.');
  }
  if (settings.packOverVoltageTriggerMv <= settings.packOverVoltageReleaseMv || settings.cellOverVoltageTriggerMv <= settings.cellFullVoltageMv) {
    errors.push('Overvoltage triggers must be higher than their release values.');
  }
  if (settings.packUnderVoltageTriggerMv >= settings.packUnderVoltageReleaseMv || settings.cellUnderVoltageTriggerMv >= settings.cellMinVoltageMv) {
    errors.push('Undervoltage triggers must be lower than their release values.');
  }
  if (settings.chargeOverCurrentMa <= 0 || settings.dischargeOverCurrentMa >= 0) {
    errors.push('Charge current must be positive and discharge current must be negative.');
  }
  const currentUnitMa = settings.functionConfigRaw & (1 << 12) ? 100 : 10;
  if (settings.chargeOverCurrentMa % currentUnitMa !== 0 || settings.dischargeOverCurrentMa % currentUnitMa !== 0) {
    errors.push(`Overcurrent limits must use ${currentUnitMa} mA increments for this BMS.`);
  }
  if (settings.chargeOverCurrentMa > 32767 * currentUnitMa || settings.dischargeOverCurrentMa < -32768 * currentUnitMa) {
    errors.push(`Overcurrent limits exceed the signed register range for ${currentUnitMa} mA steps.`);
  }
  const byteDelays = [
    settings.chargeOverTempDelaySeconds, settings.chargeUnderTempDelaySeconds,
    settings.dischargeOverTempDelaySeconds, settings.dischargeUnderTempDelaySeconds,
    settings.packOverVoltageDelaySeconds, settings.packUnderVoltageDelaySeconds,
    settings.cellOverVoltageDelaySeconds, settings.cellUnderVoltageDelaySeconds,
    settings.chargeOverCurrentTriggerDelaySeconds, settings.chargeOverCurrentReleaseSeconds,
    settings.dischargeOverCurrentTriggerDelaySeconds, settings.dischargeOverCurrentReleaseSeconds,
  ];
  if (byteDelays.some(value => !Number.isInteger(value) || value < 0 || value > 255)) errors.push('Protection delays must be whole seconds from 0 to 255.');
  if (settings.level2OverVoltageMv < 1000 || settings.level2OverVoltageMv > 5000 || settings.level2UnderVoltageMv < 1000 || settings.level2UnderVoltageMv > 5000) {
    errors.push('Level 2 voltage thresholds must be between 1000 and 5000 mV.');
  }
  if (!LEVEL2_OV_DELAY_CODES.includes(settings.level2OverVoltageDelaySeconds) || !LEVEL2_UV_DELAY_CODES.includes(settings.level2UnderVoltageDelaySeconds)) {
    errors.push('Level 2 protection delay is not supported by this BMS.');
  }
  if (settings.level2OverCurrentCode < 0 || settings.level2OverCurrentCode > 15 || settings.level2OverCurrentDelayCode < 0 || settings.level2OverCurrentDelayCode > 7) {
    errors.push('Level 2 overcurrent selection is outside the documented range.');
  }
  if (settings.level3ShortCircuitCode < 0 || settings.level3ShortCircuitCode > 7 || settings.level3ShortCircuitDelayCode < 0 || settings.level3ShortCircuitDelayCode > 3) {
    errors.push('Level 3 short-circuit selection is outside the documented range.');
  }
  if (!Number.isInteger(settings.level3ResetSeconds) || settings.level3ResetSeconds < 0 || settings.level3ResetSeconds > 255) {
    errors.push('Level 3 reset time must be between 0 and 255 seconds.');
  }
  return errors;
}

export function encodeBmsSettings(settings: BmsSettings, baseline: BmsSettings, dirtyKeys: EditableSettingKey[]): Array<[number, number]> {
  const writes: Array<[number, number]> = [];
  const capacityUnitMah = baseline.functionConfigRaw & (1 << 12) ? 100 : 10;
  const currentUnitMa = baseline.functionConfigRaw & (1 << 12) ? 100 : 10;
  for (const [key, register, encode] of REGISTER_FIELDS) {
    if (!dirtyKeys.includes(key)) continue;
    const value = settings[key] as number;
    let encoded = encode(value);
    if (key === 'totalBatteryCapacityMah' || key === 'totalCycleCapacityMah') encoded = Math.round(value / capacityUnitMah);
    if (key === 'chargeOverCurrentMa' || key === 'dischargeOverCurrentMa') encoded = Math.round(value / currentUnitMa) & 0xffff;
    writes.push([register, encoded]);
  }
  const packedDelayRegisters: Array<[number, NumericSettingKey, NumericSettingKey]> = [
    [0x3a, 'chargeUnderTempDelaySeconds', 'chargeOverTempDelaySeconds'],
    [0x3b, 'dischargeUnderTempDelaySeconds', 'dischargeOverTempDelaySeconds'],
    [0x3c, 'packUnderVoltageDelaySeconds', 'packOverVoltageDelaySeconds'],
    [0x3d, 'cellUnderVoltageDelaySeconds', 'cellOverVoltageDelaySeconds'],
    [0x3e, 'chargeOverCurrentTriggerDelaySeconds', 'chargeOverCurrentReleaseSeconds'],
    [0x3f, 'dischargeOverCurrentTriggerDelaySeconds', 'dischargeOverCurrentReleaseSeconds'],
  ];
  for (const [register, firstKey, secondKey] of packedDelayRegisters) {
    if (!dirtyKeys.includes(firstKey) && !dirtyKeys.includes(secondKey)) continue;
    writes.push([register, ((settings[firstKey] & 0xff) << 8) | (settings[secondKey] & 0xff)]);
  }
  const secondaryKeys: EditableSettingKey[] = [
    'level2OverCurrentCode', 'level2OverCurrentDelayCode',
    'level3ShortCircuitCode', 'level3ShortCircuitDelayCode', 'level3ShortCircuitDouble',
  ];
  if (secondaryKeys.some(key => dirtyKeys.includes(key))) {
    let first = highByte(baseline.secondaryProtectionRaw);
    let second = lowByte(baseline.secondaryProtectionRaw);
    first = (first & ~0x87)
      | (settings.level3ShortCircuitDouble ? 0x80 : 0)
      | settings.level3ShortCircuitCode;
    first = (first & ~0x18) | (settings.level3ShortCircuitDelayCode << 3);
    second = (settings.level2OverCurrentDelayCode << 4) | settings.level2OverCurrentCode;
    writes.push([0x38, (first << 8) | second]);
  }
  const delayKeys: EditableSettingKey[] = [
    'level2OverVoltageDelaySeconds', 'level2UnderVoltageDelaySeconds', 'level3ResetSeconds',
  ];
  if (delayKeys.some(key => dirtyKeys.includes(key))) {
    let first = highByte(baseline.level2DelayRaw);
    let second = lowByte(baseline.level2DelayRaw);
    if (dirtyKeys.includes('level2UnderVoltageDelaySeconds')) {
      first = (first & ~0xc0) | (underVoltageDelayCode(settings.level2UnderVoltageDelaySeconds) << 6);
    }
    if (dirtyKeys.includes('level2OverVoltageDelaySeconds')) {
      first = (first & ~0x30) | (overVoltageDelayCode(settings.level2OverVoltageDelaySeconds) << 4);
    }
    if (dirtyKeys.includes('level3ResetSeconds')) second = settings.level3ResetSeconds;
    writes.push([0x39, (first << 8) | second]);
  }
  if (dirtyKeys.includes('balancerEnabled') || dirtyKeys.includes('balanceOnlyWhenCharging') || dirtyKeys.includes('switchCircuitEnabled')) {
    let flags = baseline.functionConfigRaw;
    flags = settings.switchCircuitEnabled ? flags | (1 << 0) : flags & ~(1 << 0);
    flags = settings.balancerEnabled ? flags | (1 << 2) : flags & ~(1 << 2);
    flags = settings.balanceOnlyWhenCharging ? flags | (1 << 3) : flags & ~(1 << 3);
    writes.push([0x2d, flags]);
  }
  if (NTC_KEYS.some(key => dirtyKeys.includes(key))) {
    let flags = baseline.ntcConfigRaw;
    NTC_KEYS.forEach((key, index) => {
      flags = settings[key] ? flags | (1 << index) : flags & ~(1 << index);
    });
    writes.push([0x2e, flags]);
  }
  return writes;
}
