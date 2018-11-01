/// <reference path="../bridge.d.ts" />

import * as assert from "assert"
import JavaClass from './JavaClass'
import Pointer from '../Pointer'
import JavaObject from "./JavaObject"
import { objectOrCompatibleValue } from './helpers/types'


class FieldNotFoundError extends Error {}
class FieldAccessError extends Error {}

export class Field extends JavaObject {
  static FieldNotFoundError = FieldNotFoundError
  static FieldAccessError = FieldAccessError
  name: string
  parent: JavaClass
  pointer: Pointer
  signature: string
  type: string
  isStatic: boolean = false
  private constructor({ name, type, signature, parent, pointer }: { name: string, type: string, signature: string, parent: JavaClass, pointer: Pointer }) {
    super({ name, pointer })
    this.type = type
    this.signature = signature
    this.parent = parent
  }

  /**
   * @description Initialize this instance using its parent and name.
   */
  init() {
    assert(this.parent.pointer.pointer > 0, 'Invalid parent pointer')
    try {
      let pointer = __REFLECTOR_getField(this.parent.pointer.pointer, this.name)
      assert(pointer > 0, new FieldNotFoundError)
      this.pointer = new Pointer(pointer)
    } catch(err) {
      throw new FieldNotFoundError(err)
    }
    this.isStatic = __REFLECTOR_isStatic(this.pointer.pointer)
    return this
  }

  /**
   * @description Create an uninitialized `Field` instance.
   * @param parent Parent class.
   * @param signature Field signature.
   * e.g. "someField:java.lang.String"
   */
  static createField(parent: JavaClass, signature: string): Field {
    let parts: any = signature.split(':')
    assert(parts.length == 2, `Invalid signature: ${signature}`)
    return new Field({
      name: parts[0],
      type: parts[1],
      parent,
      pointer: Pointer.NULL,
      signature
    })
  }

  /**
   * @description Set the value of the field.
   * @param instance Instance object.
   * @param value Desired field value.
   */
  set(instance: JavaObject | null, value: JavaCompatibleValue | JavaObject) {
    assert(this.pointer.pointer > 0, 'Uninitialized field')
    let result: number = -1
    try {
      if(value == null) __REFLECTOR_setFieldValue(instance && instance.pointer.pointer || 0, this.pointer.pointer, 0)
      else if(value instanceof JavaObject) {
        result = __REFLECTOR_setFieldValue(instance && instance.pointer.pointer || 0, this.pointer.pointer, value.pointer.pointer)
      } else {
        result = __REFLECTOR_setFieldRawValue(instance && instance.pointer.pointer || 0, this.pointer.pointer, [ value ])
      }
    } catch(err) {
      throw new FieldAccessError(err)
    }
    if(result < 0) throw new FieldAccessError
  }

  /**
   * @description Get the value of a field, return an uninitialized instance of `JavaObject` or compatible value.
   * @param instance Instance object.
   */
  get(instance: JavaObject | null): JavaCompatibleValue | JavaObject {
    assert(this.pointer.pointer > 0, 'Uninitialized field')
    let val: JavaCompatibleValue | JavaObject
    try {
      val = __REFLECTOR_getFieldValue(instance && instance.pointer.pointer || 0, this.pointer.pointer)
    } catch(err) {
      throw new FieldAccessError(err)
    }
    try {
      val = objectOrCompatibleValue(this.type, val, `${this.parent.name}.${this.name}`)
    } catch(err) {
      throw new FieldAccessError(`Unknown value type ${typeof val}`)
    }
    if(val instanceof JavaObject) {
      val.class = this.parent
    }
    return val
  }
}

export default Field