import JavaObject from '../Java/JavaObject'
import JavaClass from '../Java/JavaClass'
import Pointer from '../Pointer'
import Method from '../Java/Method'
import _ChatColor from './bukkit/ChatColor'
import _Logger from './Logger'
import { inspect } from 'util'
import promisify from '../helpers/promise'
import { dirname, join } from 'path'
import { EventEmitter } from 'events'
import * as assert from 'assert'
import * as fs from 'fs'


declare global {
  // Emit `enable` event on next tick when loaded
  const onDisable: Function  // onDisable hook
  const __INSPECT: Function
}
interface Plugin {
  init(instance: MineLoaderJ, logger: _Logger): void
  name: string
  logger: _Logger
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
  static jarPath: string = __UTIL_getPath()
  static path: string = dirname(MineLoaderJ.jarPath)
  static pluginDirectoryName: string = 'MineLoaderJ'
  static pluginPath: string = join(MineLoaderJ.path, MineLoaderJ.pluginDirectoryName)

  logger: _Logger = new _Logger

  static ENABLE: string = 'enable'
  static DISABLE: string = 'disable'

  plugins: Plugin[] = []
  
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

    this.registerGlobalFunctions()

    // TODO: Load modules
    this.loadPlugins()

    const handler = MineLoaderJ.getOnUncaughtErrorHandler(this)
    process.on('uncaughtException', handler)
    process.on('unhandledRejection', handler)
  }

  private static getOnUncaughtErrorHandler(self: MineLoaderJ) {
    return function onUncaughtError(err: Error) {
      self.logger.err(`An error/rejection has occurred and was not caught: ${err && (err.stack || err.message) || 'unknown error'}`)
    }
  }

  private registerGlobalFunctions() {
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
  }

  private async loadPlugins(callback?: () => void) {
    const readdir = promisify(fs.readdir)
    const mkdir = promisify(fs.mkdir)
    const stat = promisify(fs.stat)
    let pluginNames: string[]
    this.logger.info('Loading js plugins...')
    try {
      let info = await stat(MineLoaderJ.pluginPath)
      assert(info && info.isDirectory())
    } catch(err) {
      // Doesn't exist or is not a directory
      this.logger.info('Plugin directory doesn\'t exist, creating...')
      try {
        await mkdir(MineLoaderJ.pluginPath)
      } catch(err) {
        this.logger.err(`Unable to create a directory for plugins: ${err && (err.stack || err.msg) || 'unknonw error'}`)
        return
      }
    }
    try {
      pluginNames = await readdir(MineLoaderJ.pluginPath)
    } catch(err) {
      this.logger.err(`Unable to open plugin directory: ${err && (err.stack || err.msg) || 'unknonw error'}`)
      return
    }
    for(let pluginName of pluginNames) {
      if(pluginName == 'node_modules') continue
      let plugin: Plugin
      try {
        plugin = require(join(MineLoaderJ.pluginPath, pluginName))
        assert(plugin.name)
        plugin.logger = new _Logger(plugin.name)
        plugin.init(this, plugin.logger)  // Plugins must listen to `enable` and `disable` events
        this.plugins.push(plugin)
        this.logger.info(`\u001b[36mPlugin loaded: ${plugin.name}\u001b[0m`)
      } catch(err) {
        this.logger.warn(`Skipped file/directory: ${pluginName}`)
      }
    }
    if(!this.plugins.length) this.logger.warn('No js plugins are loaded')

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