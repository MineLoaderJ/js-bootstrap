/// <reference path="../bridge.d.ts" />

import * as assert from "assert"
import JavaObject from './JavaObject'
import Method from './Method'
import Field from './Field'
import Pointer from '../Pointer'


class ClassReleaseError extends Error {}
class ClassAllocateError extends Error {}
class ClassNotFoundError extends Error {}

class ClassManager {
  static ClassReleaseError = ClassReleaseError
  static ClassAllocateError = ClassAllocateError
  private classes: { [className: string]: JavaClass } = {}
  private static _instance: ClassManager
  static get instance() { return ClassManager._instance }

  constructor() { ClassManager._instance = this }

  /**
   * @description Register a new class.
   * @param clazz Instance of `JavaClass`.
   * @param name Unique name of this class.
   */
  alloc(clazz: JavaClass, name: string) {
    assert(!(name in this.classes), new ClassAllocateError)
    this.classes[name] = clazz
  }

  /**
   * @description Release a class.
   * @param clazz Class to be released.
   */
  delete(clazz: JavaClass | string, noException: boolean = false) {
    if(typeof clazz == 'string') {
      this.classes[clazz].destroy(noException)
      delete this.classes[clazz]
    } else {
      for(let className in this.classes) {
        if(this.classes[className] == clazz) {
          try {
            clazz.destroy(noException)
          } catch(err) {
            if(!noException) throw new ClassReleaseError
          }
          delete this.classes[className]
          return
        }
      }
    }
  }

  /**
   * @description Get registered class object by name.
   * @param name Name of the class.
   */
  getClass(name: string): JavaClass {
    return this.classes[name]
  }
}
new ClassManager

/**
 * Wrapper of Java class.
 */
export class JavaClass extends JavaObject {
  static ClassNotFoundError = ClassNotFoundError
  ClassManager = ClassManager
  pointer: Pointer
  name: string
  class: JavaClass
  javaName: {
    [typeName in TypeNameType]: string
  }
  methods?: {
    [methodName: string]: Method | Method[]
  }
  fields?: {
    [fieldName: string]: Field
  }

  constructor({ name, pointer } : { name: string, pointer: Pointer }) {
    super({ name, pointer })
    if(this.pointer.pointer > 0) ClassManager.instance.alloc(this, name)
  }

  /**
   * @description Get or create the class object by name. May not be initialized.
   * @param name Class name.
   */
  static forName(name: string) {
    let clazz: JavaClass
    if(clazz = ClassManager.instance.getClass(name)) return clazz
    try {
      let pointer: Pointer = new Pointer(__REFLECTOR_getClassByName(name), name)  // Will throw an error if invalid
      return new JavaClass({ name, pointer })
    } catch(err) {
      throw new ClassNotFoundError(err)
    }
  }

  init(): JavaClass {
    assert(this.pointer.pointer > 0, 'Invalid pointer')
    this.getMethods()
    this.getFields()
    return this
  }

  destroy(noException: boolean = false) {
    super.destroy(noException)
    if(this.methods) {
      let err: Error
      for(let methodName in this.methods) {
        let method = this.methods[methodName]
        if(method instanceof Method) {
          try {
            method.destroy(noException)
          } catch(e) {
            err = e
          }
        } else {
          method.forEach(overloadedMethod => {
            try {
              overloadedMethod.destroy(noException)
            } catch(e) {
              err = e
            }
          })
        }
      }
      if(err && !noException) throw err
    }
    if(this.fields) {
      let err: Error
      for(let fieldName in this.fields) {
        try {
          this.fields[fieldName].destroy()
        } catch(e) {
          err = e
        }
      }
      if(err && !noException) throw err
    }
  }

  /**
   * @description Get name of this class in Java.
   * `this.name` cannot be trusted.
   * @param type Type of desired type string format in returned value.
   */
  getName(type: TypeNameType = '') {
    if(this.javaName[type]) return this.javaName[type]
    else return this.javaName[type] = __REFLECTOR_getClassName(this.pointer.pointer, type)
  }

  /**
   * @description Get all methods.
   */
  getMethods() {
    if(this.methods) return this.methods
    this.methods = Object.create(null)
    let methodString: string | null = __REFLECTOR_getMethods(this.pointer.pointer, '')
    assert(methodString != null)
    let methodsString: string[] = methodString.replace(/;/g, '').split('\n')
    if(methodsString.length == 1 && methodsString[0] == '') methodsString = []
    let methods: Method[] = methodsString.map(method => Method.createMethod(this, method))
    methods.forEach(method => {
      try {
        method.init()
      } catch(err) {}  // Ignore uninitialization failure
      // May be overloaded
      if(!this.methods[method.name]) this.methods[method.name] = method
      else if(this.methods[method.name] instanceof Array) (this.methods[method.name] as Method[]).push(method)
      else if(this.methods[method.name] instanceof Method) (this.methods[method.name] as Method[]) = [ this.methods[method.name] as Method, method ]
    })
    return this.methods
  }

  /**
   * @description Get method object by name.
   * @param methodName Method name.
   */
  getMethod(methodName: string): Method | Method[] | undefined {
    return this.getMethods()[methodName]
  }

  /**
   * @description Get all fields.
   */
  getFields() {
    if(this.fields) return this.fields
    this.fields = Object.create(null)
    let fieldString: string | null = __REFLECTOR_getFields(this.pointer.pointer)
    assert(fieldString != null)
    let fieldsString: string[] = fieldString.replace(/;/g, '').split('\n')
    if(fieldsString.length == 1 && fieldsString[0] == '') fieldsString = []
    let fields: Field[] = fieldsString.map(field => Field.createField(this, field))
    fields.forEach(field => {
      try {
        field.init()
      } catch(err) {}  // Ignore uninitialization failure
      this.fields[field.name] = field
    })
    return this.fields
  }

  /**
   * @description Get field object by name.
   * @param fieldName Name of the field.
   */
  getField(fieldName: string): Field | undefined {
    return this.getFields()[fieldName]
  }
}

JavaObject.classLoader = JavaClass.forName

export default JavaClass