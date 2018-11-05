/// <reference path="../bridge.d.ts" />

import Pointer from '../Pointer'
import JavaClass from './JavaClass'
import * as assert from 'assert'


export class JavaObject {
  pointer: Pointer
  name: string
  class: JavaClass

  static classLoader: (className: string) => JavaClass  // Should be initialized by `JavaClass` or in outer scope

  /**
   * @description `JavaObject` constructor, returns an uninitialized `JavaObject`.
   * @param param0 Name and pointer of the object.
   */
  constructor({ name, pointer } : { name: string, pointer: Pointer }) {
    this.name = name || ''
    this.pointer = pointer || Pointer.NULL
  }

  init(): JavaObject {
    assert(this.pointer.pointer > 0, 'Invalid pointer')
    let className = __REFLECTOR_getTypeNameOfObject(this.pointer.pointer, '')
    assert(className, 'Could not determine value type, please initialize this object manually')
    // Avoid recusive import
    // `forName` is available only when `JavaClass` is imported, but `JavaClass` is a subclass of `JavaObject` and therefore must be imported after `JavaObject`
    this.class = JavaObject.classLoader(className).init()
    return this
  }

  getClass(): JavaClass {
    return this.class
  }

  destroy(noException: boolean = false) {
    // Class will not be destroyed
    try {
      this.pointer.release()
      this.pointer = Pointer.NULL
    } catch(err) {
      if(!noException) throw err
    }
  }

  toStringValue(): string {
    assert(this.pointer.pointer > 0, 'Invalid pointer')
    return __REFLECTOR_objectToString(this.pointer.pointer)
  }
}

export default JavaObject