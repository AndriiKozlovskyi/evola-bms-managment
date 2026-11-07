import type { BmsData } from './jbd';

export const mockBmsData = (): BmsData => ({
  voltage: 51.36,
  current: 4.28,
  soc: 76,
  temperatures: [27.5, 29.1],
  cells: [
    3.949, 3.952, 3.950, 3.954, 3.951, 3.953, 3.955,
    3.950, 3.952, 3.954, 3.951, 3.953, 3.946,
  ],
  updatedAt: Date.now(),
});