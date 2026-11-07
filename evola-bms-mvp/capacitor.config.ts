import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.evola.bms',
  appName: 'Evola BMS',
  webDir: 'dist',
server: {
  url: 'http://172.20.10.4:5173',
  cleartext: true,
}
};

export default config;