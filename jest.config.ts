import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets/index.js';

/**
 * CJS preset, not createEsmPreset(). The ESM preset (plus
 * `node --experimental-vm-modules`) hit a wall of Node/Jest dual-package
 * hazards on this dependency tree — @ionic/angular's "./standalone" export
 * and rxjs's esm5 subpath exports both being resolved inconsistently
 * between Jest's module loader and Node's own ESM loader, surfacing as
 * "Unexpected export statement in CJS module" / "Cannot require() ES
 * Module... it is currently being loaded by a concurrent import()" with no
 * useful file context. The CJS preset sidesteps all of that by transforming
 * everything through ts-jest/babel to CommonJS, which is the long-standing,
 * well-supported path for jest-preset-angular + Ionic + rxjs.
 */
const cjsPreset = createCjsPreset();

const config: Config = {
  ...cjsPreset,
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  modulePaths: ['<rootDir>/node_modules'],
  moduleDirectories: ['node_modules'],
  // Mirrors tsconfig.json's `paths`. TypeScript resolves these at
  // type-check time regardless, but Jest's own runtime module resolution
  // knows nothing about tsconfig `paths` — without this, a *type-only*
  // aliased import (an interface/type, erased by TS) happens to work by
  // accident, while a *value* import (an actual class/const/function via
  // the same alias) fails at runtime with "Cannot find module". Keep this
  // in sync with tsconfig.json's `paths` whenever an alias is added there.
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@pages/(.*)$': '<rootDir>/src/app/pages/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@environments/(.*)$': '<rootDir>/src/environments/$1',
    '^@directives/(.*)$': '<rootDir>/src/directives/$1',
    '^@appTypes/(.*)$': '<rootDir>/src/types/$1',
    '^@guards/(.*)$': '<rootDir>/src/guards/$1',
    '^@interceptors/(.*)$': '<rootDir>/src/interceptors/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  // cjsPreset's own default only exempts `.mjs` files from the "don't
  // transform node_modules" rule. That covers @angular/*'s fesm2022 bundles,
  // but @ionic/core's Stencil-compiled runtime (and its `swiper` bundling)
  // ships real ESM `export` syntax in plain *.js* files too — those also
  // need transforming, or Jest's CJS-mode parser chokes on the bare `export`
  // keyword. ionicons/@stencil are pulled in transitively by @ionic/core.
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@angular/common/locales/.*\\.js$|@ionic/|ionicons/|@stencil/))',
  ],
};

export default config;
