/// <reference path="bridge.d.ts" />

import * as _Java from './Java'
import _Pointer from './Pointer'
import _MineLoaderJ from './MineLoaderJ'  // Must be imported after JavaObject and JavaClass


declare global {
  const Java: typeof _Java
  const Pointer: typeof _Pointer
  const MineLoaderJ: typeof _MineLoaderJ
}
Object.defineProperty(global, 'require', {
  enumerable: true,
  writable: false,
  configurable: true,
  value: require
})
Object.defineProperty(global, 'Java', {
  enumerable: true,
  writable: false,
  configurable: true,
  value: _Java
})
Object.defineProperty(global, 'Pointer', {
  enumerable: true,
  writable: false,
  configurable: true,
  value: _Pointer
})
Object.defineProperty(global, 'MineLoaderJ', {
  enumerable: true,
  writable: false,
  configurable: true,
  value: _MineLoaderJ
})