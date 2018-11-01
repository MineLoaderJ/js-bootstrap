import * as assert from "assert"


class PointerReleaseError extends Error {}

class PointerAllocateError extends Error {}

class PointerManager {
  static PointerReleaseError = PointerReleaseError
  static PointerAllocateError = PointerAllocateError
  private pointers: {
    [ptr: number]: Pointer
  } = {}
  private static _instance: PointerManager
  static get instance() { return PointerManager._instance }

  constructor() { PointerManager._instance = this }

  /**
   * @description Register a new pointer.
   * @param pointer Pointer.
   * @param name Name of this pointer.
   */
  alloc(pointer: Pointer, name: string) {
    assert(!(pointer.pointer in this.pointers), new PointerAllocateError)
    this.pointers[pointer.pointer] = pointer
  }

  /**
   * @description Release a pointer.
   * @param pointer Pointer to be released.
   */
  delete(pointer: Pointer) {
    delete this.pointers[pointer.pointer]
    __REFLECTOR_releasePointer(pointer.pointer)
  }

  /**
   * @description Get the pointer by name (dangerous).
   * Note that names of `Pointers` is not unique.
   * @param name Name of the pointer.
   */
  getPointer(name: string): Pointer {
    for(let ptr in this.pointers) {
      if(this.pointers[ptr].name == name) return this.pointers[ptr]
    }
  }

  /**
   * @description Get the name of the pointer.
   * Note that the name may not be specified.
   * @param pointer Pointer.
   */
  getName(pointer: Pointer): string {
    return this.pointers[pointer.pointer].name
  }

  /**
   * @description Release all registered pointers.
   * Be aware of that this will invalidate all registered pointers.
   */
  releaseAll() {
    for(let ptr in this.pointers) {
      if(this.pointers[ptr] != Pointer.NULL) this.pointers[ptr].release()
    }
  }
}
new PointerManager

export class Pointer {
  static PointerManager = PointerManager
  static readonly NULL: Readonly<Pointer> = (() => {
    let NULL = new Pointer(0, 'NULL')
    NULL.release = () => { throw new PointerReleaseError('Cannot release NULL pointer') }
    return Object.freeze(NULL)
  })()
  pointer: number
  name?: string
  constructor(pointer: number, name?: string) {
    if(Pointer.NULL) assert(pointer > 0, 'Invalid pointer value')
    this.pointer = pointer
    this.name = name
    PointerManager.instance.alloc(this, name || '')
  }
  isValid(): boolean {
    return __REFLECTOR_isValidPointer(this.pointer)
  }
  release() {
    PointerManager.instance.delete(this)
    this.pointer = 0
  }
  valueOf(): RawPointer {
    return this.pointer
  }
}

export default Pointer