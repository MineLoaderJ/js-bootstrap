declare type TypeNameType = '' | 'type' | 'simple' | 'canonical'
declare type JavaCompatibleValue = number | boolean | string | null
declare type RawPointer = number


/**
 * @description Release a pointer. Return true if success otherwise false.
 * @param pointer Pointer to release.
 */
declare function __REFLECTOR_releasePointer(pointer: RawPointer): boolean

/**
 * @description Get the array type of given class, returned as a new pointer.
 * @param classPointer Pointer to the class.
 */
declare function __REFLECTOR_getArrayTypeOfClass(classPointer: RawPointer): RawPointer

/**
 * @description Get a class by its name, returned as a new pointer.
 * @param name The name of the class.
 */
declare function __REFLECTOR_getClassByName(name: string): RawPointer

/**
 * @description Get the name of a class.
 * @param classPointer Pointer to the class.
 * @param type Type of desired type string format in returned value.
 */
declare function __REFLECTOR_getClassName(classPointer: RawPointer, type: TypeNameType): string | null

/**
 * @description Get all the method signatures of a class, returned as string.
 * e.g. "testMethod0:void:[I,java.lang.Object\ntestMethod1:[Ljava.lang.Object:\ntestMethod2:java.lang.Class:java.lang.String"
 * @param classPointer Pointer to the class.
 * @param type Type of desired type string format in returned value.
 */
declare function __REFLECTOR_getMethods(classPointer: RawPointer, type: TypeNameType): string | null

/**
 * @description Determine whether a method or a field is static.
 * @param pointer Pointer to a method or field.
 */
declare function __REFLECTOR_isStatic(pointer: RawPointer): boolean

/**
 * @description Validate a pointer.
 * @param pointer Pointer to validate.
 */
declare function __REFLECTOR_isValidPointer(pointer: RawPointer): boolean

/**
 * @description Instantiate a class.
 * @param classPointer Pointer to the class.
 * @param args Arguments to instantiate the class.
 * @param rawIntMap A map that indicates whether an argument at the corresponding position is an integer instead of a pointer.
 */
declare function __REFLECTOR_newInstance(classPointer: RawPointer, args: (RawPointer | JavaCompatibleValue)[], rawIntMap: boolean[]): RawPointer

/**
 * @description Get pointer to a method of a class, returned as a new pointer.
 * @param classPointer Pointer to the class.
 * @param methodSignature Method signature.
 * e.g. "someMethod::", "someMethod::[I,java.lang.Object" or "someMethod::"
 */
declare function __REFLECTOR_getMethod(classPointer: RawPointer, methodSignature: string): RawPointer

/**
 * @description Invoke a java method and return the returned value as raw value or pointer.
 * The returned type should be checked before invocation.
 * @param objectPointer Pointer to the caller object.
 * @param methodPointer Pointer to the method.
 * @param args Arguments to invoke the method.
 * @param rawIntMap A map that indicates whether an argument at the corresponding position is an integer instead of a pointer.
 */
declare function __REFLECTOR_invokeMethod(objectPointer: RawPointer, methodPointer: RawPointer, args: (RawPointer | JavaCompatibleValue)[], rawIntMap: boolean[]): JavaCompatibleValue | RawPointer

/**
 * @description Get all fields in a class, returned as string.
 * e.g. "someField0:java.lang.String\nsomeField1:java.lang.Integer"
 * @param classPointer Pointer to the class.
 */
declare function __REFLECTOR_getFields(classPointer: RawPointer): string | null

/**
 * @description Get a pointer to a field of a class, returned as a new pointer.
 * @param classPointer Pointer to the class.
 * @param name Name of the field.
 */
declare function __REFLECTOR_getField(classPointer: RawPointer, name: string): RawPointer

/**
 * @description Get the value of a field.
 * @param objectPointer Pointer to the owner object of the field.
 * @param fieldPointer Pointer to the field.
 */
declare function __REFLECTOR_getFieldValue(objectPointer: RawPointer, fieldPointer: RawPointer): JavaCompatibleValue

/**
 * @description Set value of a field via a pointer. Return 0 if success, otherwise -1.
 * @param objectPointer Pointer to the owner object of the field.
 * @param fieldPointer Pointer to the field.
 * @param pointer Pointer to the value to set.
 */
declare function __REFLECTOR_setFieldValue(objectPointer: RawPointer, fieldPointer: RawPointer, pointer: RawPointer): RawPointer

/**
 * @description Set value of a field directly. Return 0 if success, otherwise -1.
 * @param objectPointer Pointer to the owner object of the field.
 * @param fieldPointer Pointer to the field.
 * @param value Value to set.
 */
declare function __REFLECTOR_setFieldRawValue(objectPointer: RawPointer, fieldPointer: RawPointer, value: [ JavaCompatibleValue ]): RawPointer

/**
 * @description Get the type of an object, returned as a new pointer.
 * @param objectPointer Pointer to the object.
 */
declare function __REFLECTOR_getTypeOfObject(objectPointer: RawPointer): RawPointer

/**
 * @description Get the type name of an object.
 * @param objectPointer Pointer to the object.
 * @param type Type of desired type string format in returned value.
 */
declare function __REFLECTOR_getTypeNameOfObject(objectPointer: RawPointer, type: TypeNameType): string | null

/**
 * @description Determine whether a class is compatible to be the returned type.
 * @param classPointer Pointer to class.
 */
declare function __REFLECTOR_isCompatibleType(classPointer: RawPointer): boolean

/**
 * @description Determine whether a class is compatible to be the returned type after type conversion.
 * @param classPointer Pointer to class.
 */
declare function __REFLECTOR_canBeCompatibleType(classPointer: RawPointer): boolean

/**
 * @description Get the value of an object of compaible type.
 * Return `null` if the type of the value is not even compatible, or the value itself is `null`.
 * The type should be checked before calling this function.
 * @param objectPointer Pointer to object.
 */
declare function __REFLECTOR_getCompatibleValue(objectPointer: RawPointer): JavaCompatibleValue | null

/**
 * @description Call `toString` on an object.
 * @param objectPointer Pointer to object.
 */
declare function __REFLECTOR_objectToString(objectPointer: RawPointer): string | null

/**
 * @description Send a message to the server console.
 * @param message Message string to send.
 */
declare function __MINE_LOADER_J_sendMessage(message: string): void

/**
 * @description Get plugin instance.
 */
declare function __MINE_LOADER_J_getPluginInstance(): RawPointer

/**
 * @description Write severe logging message.
 * @param msg Logging message.
 */
declare function __MINE_LOADER_J_logSEVERE(msg: string): void

/**
 * @description Write warning logging message.
 * @param msg Logging message.
 */
declare function __MINE_LOADER_J_logWARNING(msg: string): void

/**
 * @description Write info logging message.
 * @param msg Logging message.
 */
declare function __MINE_LOADER_J_logINFO(msg: string): void

/**
 * @description Write config logging message.
 * @param msg Logging message.
 */
declare function __MINE_LOADER_J_logCONFIG(msg: string): void

/**
 * @description Write fine logging message.
 * @param msg Logging message.
 */
declare function __MINE_LOADER_J_logFINE(msg: string): void

/**
 * @description Write finer logging message.
 * @param msg Logging message.
 */
declare function __MINE_LOADER_J_logFINER(msg: string): void

/**
 * @description Write finest logging message.
 * @param msg Logging message.
 */
declare function __MINE_LOADER_J_logFINEST(msg: string): void

/**
 * @description Broadcast message to whole server.
 * @param msg Message to broadcast.
 */
declare function __MINE_LOADER_J_broadcastMessage(msg: string): void

/**
 * @description Get plugin jar path.
 */
declare function __UTIL_getPath(): string