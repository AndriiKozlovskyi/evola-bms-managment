# Evola BMS Monitor — MVP

Minimal Vue 3 + Capacitor 8 app to read JBD/Jabaida/Xiaoxiang BLE BMS telemetry on Android/iOS.

## Requirements
- Node.js 22+, Android Studio + Android SDK, a real Android phone with Bluetooth.
- For iOS later: a Mac, Xcode, Apple signing, real iPhone (simulator has no BLE).

## Android
```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
In Android Studio, select your USB-connected device (USB debugging on), then press Run.

## iOS later
```bash
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```
Add `NSBluetoothAlwaysUsageDescription` to `ios/App/App/Info.plist`, for example: `Bluetooth is required to read the e-bike battery.`
For this foreground-only MVP, don't enable background modes yet.

## What it does
- Scans with JBD standard FF00 GATT service, connects, subscribes to FF01.
- Sends ONLY the JBD READ commands for registers 0x03 (basic info) and 0x04 (cell voltages), to FF02.
- Reassembles fragmented BLE notifications, checks frames/checksums, decodes voltage/current/SOC/temperatures/cells.
- Does NOT change BMS settings or MOSFET states.

## Limitations
- The FF00/FF01/FF02 profile is common, not universal. If your BMS uses a different GATT profile, change the UUIDs in `src/services/jbd.ts` after inspecting it with nRF Connect.
- BMS with password-based authorization may require an additional authenticated handshake. This MVP does not bypass authentication.
- The plugin requests Bluetooth permissions; Android 11 or older may require enabled Location Services for BLE scanning.
- No background service, server or device authentication in MVP.
- Test against the official Xiaoxiang app. SOC is as reported by the BMS, not an independent capacity measurement.

## References
- https://github.com/capacitor-community/bluetooth-le
- https://github.com/lvacek2026/conexpro-bms-bridge/blob/main/docs/PROTOCOL.md
