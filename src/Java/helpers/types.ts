/// <reference path="../../bridge.d.ts" />

import JavaObject from "../JavaObject"
import Pointer from "../../Pointer"


/**
 * @description Get uninitialized object or compatible value according to its type.
 * @param type Class name of the type of the object.
 * @param value Value.
 * @param name Name of the value.
 */
export function objectOrCompatibleValue(type: string, value: JavaCompatibleValue | RawPointer, name?: string): JavaCompatibleValue | JavaObject {
  let val: JavaCompatibleValue | JavaObject = value
    if(type == 'int' || type == 'java.lang.Integer' || type == 'I') return value
    else if(value == null) {
      return null
    } else {
      switch(typeof val) {
        case 'string':
        case 'boolean': return val
        case 'number': {
          if(Math.floor(val) == val) {
            let _name = `value-${name}.${name}@${val}`
            let ret = new JavaObject({
              name: _name,
              pointer: new Pointer(val, _name)
            })
            return ret
          } else return val
        }
        default: throw new TypeError(`Unknown value type ${typeof val}`)
      }
    }
}