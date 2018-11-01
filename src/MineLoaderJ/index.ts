import JavaObject from '../Java/JavaObject'
import JavaClass from '../Java/JavaClass'
import Pointer from '../Pointer'
import Method from '../Java/Method'
import _ChatColor from './bukkit/ChatColor'
import _Logger, { Logger } from './Logger'
import { inspect } from 'util'
import { EventEmitter } from 'events'


declare global {
  // Emit `enable` event on next tick when loaded
  const onDisable: Function  // onDisable hook
  const __INSPECT: Function
}
export class MineLoaderJ extends EventEmitter {
  static ChatColor: typeof _ChatColor = _ChatColor
  static Logger: typeof _Logger = _Logger
  static instance: MineLoaderJ
  pluginInstance: JavaObject
  server: JavaObject
  Server: JavaClass
  consoleSender: JavaObject
  ConsoleSender: JavaClass
  sendMessage: Method

  logger: _Logger = new Logger

  static ENABLE: string = 'enable'
  static DISABLE: string = 'disable'
  
  /**
   * @description Don't instantiate this class manually!
   */
  constructor() {
    super()
    MineLoaderJ.instance = this

    let pointer = __MINE_LOADER_J_getPluginInstance()
    this.pluginInstance = new JavaObject({
      name: 'MineLoaderJ.instance',
      pointer: new Pointer(pointer, 'MineLoaderJ.instance')
    }).init()
    if(!(this.pluginInstance.class.methods.getServer instanceof Array)) {
      this.server = this.pluginInstance.class.methods.getServer.invoke(this.pluginInstance, []).init()
    }

    this.Server = this.server.getClass()
    if(!(this.Server.methods.getConsoleSender instanceof Array)) {
      this.consoleSender = this.Server.methods.getConsoleSender.invoke(this.server, []).init()
    }

    this.ConsoleSender = this.consoleSender.getClass()
    if(this.ConsoleSender.methods.sendMessage instanceof Array) {
      for(let method of this.ConsoleSender.methods.sendMessage) {
        if(method.argumentTypes.length == 1 && method.argumentTypes[0] == 'java.lang.String') {
          this.sendMessage = method
          break
        }
      }
    } else {
      this.sendMessage = this.ConsoleSender.methods.sendMessage
    }

    // Register `__INSPECT`
    function __INSPECT(obj: any, colors: boolean) {
      return inspect(obj, { colors: colors, maxArrayLength: 20 })
    }
    Object.defineProperty(global, '__INSPECT', {
      enumerable: true,
      writable: false,
      configurable: true,
      value: __INSPECT
    })

    // Register `onDisable` hook
    const self: MineLoaderJ = this
    function onDisable() {
      self.emit(MineLoaderJ.DISABLE)
      self.logger.info('`disable` event emitted')
    }
    Object.defineProperty(global, 'onDisable', {
      enumerable: true,
      writable: false,
      configurable: true,
      value: onDisable
    })

    // Initialize logger

    // TODO: Load modules

    // Emit `enable` event
    this.emit(MineLoaderJ.ENABLE)
    this.logger.info('`enable` event emitted')
  }

  /**
   * @description Send messages directly to the console.
   * @param messages Messages to send.
   */
  sendMessageToConsole(...messages) {
    // this.sendMessage.invoke(this.consoleSender, [ args.join(' ') ])
    __MINE_LOADER_J_sendMessage(messages.join(' '))
  }

  /**
   * @description Broadcast message to whole server.
   * @param messages Message to broadcast.
   */
  broadcastMessage(...messages) {
    __MINE_LOADER_J_broadcastMessage(messages.join(' '))
  }
}

new MineLoaderJ

export default MineLoaderJ