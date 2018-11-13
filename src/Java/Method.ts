/// <reference path="../bridge.d.ts" />

import * as assert from "assert"
import JavaClass from './JavaClass'
import Pointer from '../Pointer'
import JavaObject from "./JavaObject"
import { objectOrCompatibleValue } from "./helpers/types";


class MethodNotFoundError extends Error {}
class InvocationError extends Error {}

export class Method extends JavaObject {
  static MethodNotFoundError = MethodNotFoundError
  static InvocationError = InvocationError
  name: string
  parent: JavaClass
  pointer: Pointer
  returnedType: string
  argumentTypes: string[]
  signature: string
  isStatic: boolean = false
  private constructor({ name, parent, pointer, returnedType, argumentTypes, signature }: { name: string, parent: JavaClass, pointer: Pointer, returnedType: string, argumentTypes: string[], signature?: string }) {
    super({ name, pointer })
    this.parent = parent
    this.returnedType = returnedType
    this.argumentTypes = argumentTypes
    this.signature = signature || `${this.name}:${this.returnedType}:${this.argumentTypes}`
  }

  /**
   * @description Initialize this instance using its parent and signature.
   */
  init() {
    assert(this.parent.pointer.pointer > 0, 'Invalid parent pointer')
    try {
      let pointer = __REFLECTOR_getMethod(this.parent.pointer.pointer, this.signature)
      assert(pointer > 0, new MethodNotFoundError)
      this.pointer = new Pointer(pointer)
    } catch(err) {
      throw new MethodNotFoundError('Method signature may be in invalid format')
    }
    this.isStatic = __REFLECTOR_isStatic(this.pointer.pointer)
    return this
  }

  /**
   * @description Create an uninitialized `Method` instance.
   * @param parent Parent class.
   * @param signature Method signature.
   * e.g. "someMethod:java.lang.String:[I,[Ljava.lang.Object"
   */
  static createMethod(parent: JavaClass, signature: string): Method {
    let parts: any = signature.split(':')
    assert(parts.length == 3)
    parts[2] = parts[2].split(',')
    return new Method({
      name: parts[0],
      parent,
      pointer: Pointer.NULL,
      returnedType: parts[1],
      argumentTypes: parts[2],
      signature
    })
  }

  /**
   * @description Invoke a method.
   * @param caller Caller object.
   * @param args Arguments of invocation.
   */
  invoke(caller: JavaObject | null, args: (JavaCompatibleValue | JavaObject)[]): any {
    assert(this.pointer.pointer > 0, 'Uninitialized method')
    let rawIntMap: boolean[] = []
    let _args: JavaCompatibleValue[] = args.map((arg, index) => {
      switch(typeof arg) {
        case 'undefined': return null
        case 'number': if(Math.floor(arg) == arg) rawIntMap[index] = true
        case 'string':
        case 'boolean': return arg
        default: {
          assert(arg instanceof JavaObject && arg.pointer.pointer > 0, `Invalid argument type (index: ${index})`)
          rawIntMap[index] = false
          return arg.pointer.pointer
        }
      }
    })
    try {
      let ret: JavaCompatibleValue | JavaObject =  objectOrCompatibleValue(this.returnedType, __REFLECTOR_invokeMethod(caller && caller.pointer.pointer || 0, this.pointer.pointer, _args, rawIntMap), `${this.parent.name}.${this.name}()`)
      if(ret instanceof JavaObject) ret.init()
      return ret
    } catch(err) {
      throw new InvocationError(err)
    }
  }
}

export default Method