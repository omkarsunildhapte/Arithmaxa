import type { Config } from 'jest';
import { createEsmPreset } from 'jest-preset-angular/presets/index.js';

const esmPreset = createEsmPreset();

const config: Config = {
  ...esmPreset,
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  modulePaths: ['<rootDir>/node_modules'],
  moduleDirectories: ['node_modules'],
  transformIgnorePatterns: ['node_modules/(?!(tslib|@ionic|ionicons)/)'],
  moduleNameMapper: {
    ...esmPreset.moduleNameMapper,
    '^@ionic/angular/standalone$':
      '<rootDir>/node_modules/@ionic/angular/standalone/index.js'
  }
};

export default config;
